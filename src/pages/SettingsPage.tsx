import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    User, Globe, Bell, FileText, Wifi, Shield,
    Save, LogOut, ChevronDown, ChevronUp, Loader2,
    Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

// --- Types ---
interface SettingsState {
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
        offlineMode: boolean; // mock
        syncFreq: 'daily' | 'weekly';
    };
}

const DEFAULT_SETTINGS: SettingsState = {
    profile: {
        name: '',
        state: '',
        district: '',
        preferredCrops: [],
        farmSize: 'small'
    },
    language: {
        appLanguage: 'en',
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

const CROP_OPTIONS = ["Wheat", "Rice", "Maize", "Cotton", "Mustard", "Sugarcane", "Potato", "Tomato", "Soybean"];

export default function SettingsPage() {
    const { currentUser } = useAuth();
    const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openSection, setOpenSection] = useState<string | null>('profile'); // For mobile accordion

    // --- distinct screen sizes ---
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // --- Load Data ---
    useEffect(() => {
        const fetchSettings = async () => {
            if (!currentUser) return;
            try {
                const docRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().settings) {
                    // Merge with defaults to ensure structure
                    setSettings(prev => ({ ...prev, ...docSnap.data().settings }));
                } else {
                    // Pre-fill email/name if available from Auth
                    setSettings(prev => ({
                        ...prev,
                        profile: { ...prev.profile, name: currentUser.displayName || '' }
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

    // --- Save Data ---
    const handleSave = async () => {
        if (!currentUser) return;
        setSaving(true);
        try {
            const docRef = doc(db, 'users', currentUser.uid);
            await setDoc(docRef, { settings }, { merge: true });
            // Simple visual feedback
            const btn = document.getElementById('save-btn');
            if (btn) btn.innerText = "Saved!";
            setTimeout(() => {
                if (btn) btn.innerText = "Save Preferences";
            }, 2000);
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/login';
    };

    const updateProfile = (field: keyof SettingsState['profile'], value: any) => {
        setSettings(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };
    const updateLang = (field: keyof SettingsState['language'], value: any) => {
        setSettings(prev => ({ ...prev, language: { ...prev.language, [field]: value } }));
    };
    const updateAlert = (field: keyof SettingsState['alerts'], value: any) => {
        setSettings(prev => ({ ...prev, alerts: { ...prev.alerts, [field]: value } }));
    };
    const updatePlanning = (field: keyof SettingsState['planning'], value: any) => {
        setSettings(prev => ({ ...prev, planning: { ...prev.planning, [field]: value } }));
    };
    const updateData = (field: keyof SettingsState['data'], value: any) => {
        setSettings(prev => ({ ...prev, data: { ...prev.data, [field]: value } }));
    };

    const toggleCrop = (crop: string) => {
        const current = settings.profile.preferredCrops;
        const updated = current.includes(crop)
            ? current.filter(c => c !== crop)
            : [...current, crop];
        updateProfile('preferredCrops', updated);
    };

    // --- Render Logic ---

    // Utility for Section Wrapper
    const Section = ({ id, title, icon: Icon, children }: any) => {
        const isOpen = !isMobile || openSection === id;

        return (
            <div className="bg-white/60 backdrop-blur-md border border-white/60 rounded-2xl overflow-hidden shadow-sm transition-all duration-300">
                <button
                    onClick={() => setOpenSection(openSection === id ? null : id)}
                    className="w-full flex items-center justify-between p-4 md:p-6 bg-white/40 hover:bg-white/60 transition-colors text-left"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                            <Icon size={20} />
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    </div>
                    {isMobile && (
                        isOpen ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />
                    )}
                </button>

                {isOpen && (
                    <div className="p-4 md:p-6 pt-0 space-y-6 border-t border-gray-100/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {children}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-[1200px] mx-auto space-y-6 pb-20">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-lg shadow-emerald-900/5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Settings & Preferences</h1>
                        <p className="text-gray-500 text-sm">Customize your Krishisethu experience</p>
                    </div>
                    <button
                        id="save-btn"
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* 1. Profile & Context */}
                    <Section id="profile" title="Profile & Farm Context" icon={User}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Farmer Name" value={settings.profile.name} onChange={(e: any) => updateProfile('name', e.target.value)} placeholder="Full Name" />
                            <Input label="State" value={settings.profile.state} onChange={(e: any) => updateProfile('state', e.target.value)} placeholder="e.g. Punjab" />
                            <Input label="District" value={settings.profile.district} onChange={(e: any) => updateProfile('district', e.target.value)} placeholder="e.g. Ludhiana" />

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Farm Size</label>
                                <select
                                    className="w-full rounded-xl border-gray-200 bg-white/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border"
                                    value={settings.profile.farmSize}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateProfile('farmSize', e.target.value)}
                                >
                                    <option value="marginal">Marginal (&lt; 1 hectare)</option>
                                    <option value="small">Small (1-2 hectares)</option>
                                    <option value="medium">Medium (2-10 hectares)</option>
                                    <option value="large">Large (&gt; 10 hectares)</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Preferred Crops</label>
                            <div className="flex flex-wrap gap-2">
                                {CROP_OPTIONS.map(crop => {
                                    const active = settings.profile.preferredCrops.includes(crop);
                                    return (
                                        <button
                                            key={crop}
                                            onClick={() => toggleCrop(crop)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all flex items-center gap-2 ${active ? 'bg-green-100 border-green-200 text-green-800' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                        >
                                            {crop}
                                            {active && <Check size={14} />}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    </Section>

                    {/* 2. Language & Accessibility */}
                    <Section id="language" title="Language & Accessibility" icon={Globe}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select label="App Language" value={settings.language.appLanguage} onChange={(e: any) => updateLang('appLanguage', e.target.value)}>
                                <option value="en">English</option>
                                <option value="hi">Hindi (हिंदी)</option>
                                <option value="ta">Tamil (தமிழ்)</option>
                            </Select>
                            <Select label="Text Size" value={settings.language.textSize} onChange={(e: any) => updateLang('textSize', e.target.value)}>
                                <option value="small">Small</option>
                                <option value="medium">Medium (Default)</option>
                                <option value="large">Large</option>
                            </Select>
                        </div>

                        <div className="space-y-4 pt-2">
                            <Toggle label="Voice Assistant" checked={settings.language.voiceAssistant} onChange={(c: boolean) => updateLang('voiceAssistant', c)} />
                            {settings.language.voiceAssistant && (
                                <Select label="Voice Language" value={settings.language.voiceLanguage} onChange={(e: any) => updateLang('voiceLanguage', e.target.value)}>
                                    <option value="en">Same as App Language</option>
                                    <option value="hi">Hindi</option>
                                    <option value="en-IN">English (Indian)</option>
                                </Select>
                            )}
                            <Toggle label="Read Alerts Aloud" checked={settings.language.readAlerts} onChange={(c: boolean) => updateLang('readAlerts', c)} description="Automatically speak out high priority alerts" />
                        </div>
                    </Section>

                    {/* 3. Alerts & Planning */}
                    <div className="space-y-6">
                        {/* Alerts */}
                        <Section id="alerts" title="Notifications" icon={Bell}>
                            <div className="space-y-4">
                                <Toggle label="Weather Alerts" description="Heatwaves, heavy rain, frost" checked={settings.alerts.weather} onChange={(c: boolean) => updateAlert('weather', c)} />
                                <Toggle label="Crop Health Alerts" description="Pest & disease warnings" checked={settings.alerts.cropHealth} onChange={(c: boolean) => updateAlert('cropHealth', c)} />
                                <Toggle label="Govt Schemes" description="Subsidy & scheme updates" checked={settings.alerts.schemes} onChange={(c: boolean) => updateAlert('schemes', c)} />
                                <Toggle label="Task Reminders" description="Daily farming activity follow-ups" checked={settings.alerts.tasks} onChange={(c: boolean) => updateAlert('tasks', c)} />
                            </div>
                        </Section>

                        {/* Planning */}
                        <Section id="planning" title="Planning Strategy" icon={FileText}>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-2 block">Planning Mode</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['conservative', 'balanced', 'aggressive'].map(m => (
                                            <button
                                                key={m}
                                                onClick={() => updatePlanning('mode', m)}
                                                className={`py-2 px-1 rounded-lg text-xs font-bold capitalize border transition-all ${settings.planning.mode === m ? 'bg-indigo-100 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        {settings.planning.mode === 'conservative' ? 'Low risk, stable yields.' : settings.planning.mode === 'balanced' ? 'Optimal risk-reward ratio.' : 'High risk, maximum potential yield.'}
                                    </p>
                                </div>

                                <Select label="Budget Strictness" value={settings.planning.budgetStrictness} onChange={(e: any) => updatePlanning('budgetStrictness', e.target.value)}>
                                    <option value="strict">Strict (Never Exceed)</option>
                                    <option value="flexible">Flexible (+/- 10%)</option>
                                </Select>

                                <Select label="Irrigation Preference" value={settings.planning.irrigation} onChange={(e: any) => updatePlanning('irrigation', e.target.value)}>
                                    <option value="water-saving">Water Saving (Eco)</option>
                                    <option value="yield">Yield Focused</option>
                                </Select>
                            </div>
                        </Section>
                    </div>

                    {/* 4. Data & Privacy */}
                    <div className="space-y-6">
                        {/* Data */}
                        <Section id="data" title="Data & Connectivity" icon={Wifi}>
                            <div className="space-y-4">
                                <Toggle label="Low Bandwidth Mode" checked={settings.data.lowBandwidth} onChange={(c: boolean) => updateData('lowBandwidth', c)} />
                                <Toggle label="Offline Mode (Mock)" checked={settings.data.offlineMode} onChange={(c: boolean) => updateData('offlineMode', c)} />
                                <Select label="Sync Frequency" value={settings.data.syncFreq} onChange={(e: any) => updateData('syncFreq', e.target.value)}>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </Select>
                                <button className="text-sm text-red-500 underline font-medium hover:text-red-600 w-fit">
                                    Clear Cached Data
                                </button>
                            </div>
                        </Section>

                        {/* Privacy */}
                        <Section id="privacy" title="Privacy & Security" icon={Shield}>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-sm text-amber-800 space-y-2 mb-4">
                                <p>• We use public crop calendars and weather data.</p>
                                <p>• No chemical or medical prescriptions are generated.</p>
                                <p>• Your personal data is not shared with third parties.</p>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button className="w-full py-2 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 text-sm">
                                    Export My Data (JSON)
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl font-medium flex items-center justify-center gap-2 text-sm"
                                >
                                    <LogOut size={16} />
                                    Log Out
                                </button>
                            </div>
                        </Section>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}

// --- Reusable Components ---

function Input({ label, ...props }: any) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <input className="w-full rounded-xl border-gray-200 bg-white/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border transition-all" {...props} />
        </div>
    )
}

function Select({ label, children, ...props }: any) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            <select className="w-full rounded-xl border-gray-200 bg-white/50 p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500 border transition-all" {...props}>
                {children}
            </select>
        </div>
    )
}

interface ToggleProps {
    label: string;
    description?: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
    return (
        <div className="flex items-center justify-between cursor-pointer group" onClick={() => onChange(!checked)}>
            <div>
                <div className="text-sm font-medium text-gray-800 group-hover:text-emerald-700 transition-colors">{label}</div>
                {description && <div className="text-xs text-gray-500 leading-tight">{description}</div>}
            </div>
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-emerald-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
        </div>
    )
}
