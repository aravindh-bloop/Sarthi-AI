import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Building2, Banknote, Calendar, MapPin, ChevronRight,
    Search, Filter, Bookmark, CheckCircle, AlertCircle,
    BrainCircuit, ExternalLink, X, Coins, Clock, Sprout,
    ShieldCheck, AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---

interface Scheme {
    id: string;
    title: string;
    provider: 'Central Govt' | 'State Govt';
    category: 'Subsidy' | 'Insurance' | 'Loan' | 'Income Support';
    summary: string;
    benefitAmount: string; // e.g., "₹6,000 / year" or "55% Subsidy"
    deadline: string; // ISO date or "Open"
    status: 'Active' | 'Closing Soon' | 'Urgent';
    state: string; // "All" or specific state
    applicableCrops: string[];
    eligibility: {
        landSize?: string; // e.g. "< 2 Hectares"
        farmerCategory?: string; // "Small/Marginal"
    };
    link: string;
    documents: string[];
}

// --- Mock Data ---

const SCHEMES: Scheme[] = [
    {
        id: 's1',
        title: 'PM-KISAN Samman Nidhi',
        provider: 'Central Govt',
        category: 'Income Support',
        summary: 'Financial benefit of ₹6,000/- per year in three equal installments to all landholding farmers.',
        benefitAmount: '₹6,000 / year',
        deadline: 'Open',
        status: 'Active',
        state: 'All',
        applicableCrops: ['All'],
        eligibility: { landSize: 'Any', farmerCategory: 'Landholding' },
        link: 'https://pmkisan.gov.in/',
        documents: ['Aadhaar Card', 'Land Ownership Papers', 'Bank Passbook']
    },
    {
        id: 's2',
        title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
        provider: 'Central Govt',
        category: 'Insurance',
        summary: 'Crop insurance scheme providing financial support in case of crop failure due to natural calamities.',
        benefitAmount: 'Coverage up to ₹50k/ha',
        deadline: '2026-03-31',
        status: 'Urgent',
        state: 'All',
        applicableCrops: ['Rice', 'Wheat', 'Cotton', 'Sugarcane'],
        eligibility: { farmerCategory: 'All' },
        link: 'https://pmfby.gov.in/',
        documents: ['Sowing Certificate', 'Land Records', 'Aadhaar']
    },
    {
        id: 's3',
        title: 'Tamil Nadu Micro Irrigation Subsidy',
        provider: 'State Govt',
        category: 'Subsidy',
        summary: 'Subsidy for installing drip/sprinkler irrigation systems. 100% for small farmers, 75% for others.',
        benefitAmount: '75% - 100% Subsidy',
        deadline: '2026-04-15',
        status: 'Closing Soon',
        state: 'Tamil Nadu',
        applicableCrops: ['Tomato', 'Banana', 'Vegetables', 'Sugarcane'],
        eligibility: { landSize: '< 5 Acres', farmerCategory: 'Small/Marginal' },
        link: 'https://tnhorticulture.tn.gov.in/',
        documents: ['Chitta/Adangal', 'Map', 'Soil/Water Test']
    },
    {
        id: 's4',
        title: 'Kisan Credit Card (KCC) Scheme',
        provider: 'Central Govt',
        category: 'Loan',
        summary: 'Short-term credit for crops at subsidized interest rates (4% on prompt repayment).',
        benefitAmount: 'Loan limit based on crop',
        deadline: 'Open',
        status: 'Active',
        state: 'All',
        applicableCrops: ['All'],
        eligibility: { farmerCategory: 'All' },
        link: 'https://www.myscheme.gov.in/schemes/kcc',
        documents: ['ID Proof', 'Address Proof', 'Land Documents']
    }
];

// --- Components ---

function DeadlineBadge({ deadline, status }: { deadline: string, status: Scheme['status'] }) {
    if (status === 'Urgent') {
        return (
            <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold border border-red-200 animate-pulse">
                <AlertCircle className="w-3 h-3" /> Closing Soon: {new Date(deadline).toLocaleDateString()}
            </div>
        );
    }
    if (status === 'Closing Soon') {
        return (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold border border-amber-200">
                <Clock className="w-3 h-3" /> Deadline: {new Date(deadline).toLocaleDateString()}
            </div>
        );
    }
    return (
        <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
            <CheckCircle className="w-3 h-3" /> Active
        </div>
    );
}

export default function NewsPage() {
    const [filterCategory, setFilterCategory] = useState<'All' | 'Subsidy' | 'Insurance' | 'Loan'>('All');
    const [showMyCropsOnly, setShowMyCropsOnly] = useState(true);
    const [savedSchemes, setSavedSchemes] = useState<string[]>([]);
    const [explainingId, setExplainingId] = useState<string | null>(null);
    const [eligibilityCheck, setEligibilityCheck] = useState<string | null>(null);

    // Mock Context for User
    const userLocation = "Tamil Nadu";
    const userCrops = ["Tomato", "Rice"];
    const userLandSize = "1.5 Hectares"; // Small Farmer

    // Filter Logic
    const filteredSchemes = SCHEMES.filter(s => {
        const catMatch = filterCategory === 'All' || s.category === filterCategory;
        const stateMatch = s.state === 'All' || s.state === userLocation;
        const cropMatch = !showMyCropsOnly || s.applicableCrops.includes('All') || s.applicableCrops.some(c => userCrops.includes(c));
        return catMatch && stateMatch && cropMatch;
    });

    const toggleSave = (id: string) => {
        if (savedSchemes.includes(id)) {
            setSavedSchemes(savedSchemes.filter(s => s !== id));
        } else {
            setSavedSchemes([...savedSchemes, id]);
        }
    };

    const handleEligibilityCheck = (scheme: Scheme) => {
        // Simple logic for demo
        if (scheme.title.includes("Micro Irrigation") && userLocation !== "Tamil Nadu") {
            return "not_eligible";
        }
        return "eligible";
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen relative pb-20 bg-gray-50/50">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#0ea5e9_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                    {/* Header & Location */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-blue-600" />
                                Government Schemes & Subsidies
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Verified benefits for <span className="font-bold text-gray-800">{userLocation}</span> farmers.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm text-sm font-medium text-gray-700">
                            <MapPin className="w-4 h-4 text-red-500" />
                            {userLocation}, India
                            <button className="text-xs text-blue-600 font-bold ml-2 hover:underline">Change</button>
                        </div>
                    </div>

                    {/* High-Impact Summary Card */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Coins className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-lg font-bold opacity-90 mb-1">Your Benefit Potential</h2>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-extrabold">₹58,000</span>
                                <span className="text-sm opacity-75">est. this season</span>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> Eligible for 3 Schemes
                                </span>
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3 text-yellow-300" /> 1 Deadline approaching
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Layout: Sidebar + Main Feed */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Filter className="w-4 h-4" /> Filters
                                </h3>

                                <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer mb-2">
                                    <input
                                        type="checkbox"
                                        checked={showMyCropsOnly}
                                        onChange={(e) => setShowMyCropsOnly(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Relevant to My Crops</span>
                                </label>

                                <div className="space-y-1">
                                    {['All', 'Subsidy', 'Insurance', 'Loan'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setFilterCategory(cat as any)}
                                            className={clsx("w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition",
                                                filterCategory === cat ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Alert Widget */}
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                <h4 className="font-bold text-amber-800 text-sm mb-2 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Action Required
                                </h4>
                                <p className="text-xs text-amber-700 leading-relaxed">
                                    You haven't renewed your PMFBY insurance for the upcoming Kharif season. Deadline in <span className="font-bold">5 days</span>.
                                </p>
                            </div>
                        </div>

                        {/* Main Feed */}
                        <div className="lg:col-span-3 space-y-6">
                            {filteredSchemes.map(scheme => (
                                <div key={scheme.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow group relative">
                                    <div className="p-6">

                                        {/* Top Row: Provider & Status */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                                                    scheme.provider === 'Central Govt' ? "bg-orange-100 text-orange-700" : "bg-purple-100 text-purple-700"
                                                )}>
                                                    {scheme.provider === 'Central Govt' ? 'GOI' : 'TN'}
                                                </div>
                                                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">
                                                    {scheme.category}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => toggleSave(scheme.id)} className="text-gray-400 hover:text-blue-600 transition">
                                                    <Bookmark className={clsx("w-5 h-5", savedSchemes.includes(scheme.id) && "fill-blue-600 text-blue-600")} />
                                                </button>
                                                <DeadlineBadge deadline={scheme.deadline} status={scheme.status} />
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                    {scheme.title}
                                                </h3>
                                                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                                                    {scheme.summary}
                                                </p>

                                                {/* Meta Tags */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                        <Sprout className="w-3 h-3" /> Crops: {scheme.applicableCrops.join(', ')}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                                        <ShieldCheck className="w-3 h-3" /> Eligibility: {scheme.eligibility.landSize || 'All'}, {scheme.eligibility.farmerCategory}
                                                    </span>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex flex-wrap gap-3 mt-4">
                                                    <button
                                                        onClick={() => setExplainingId(explainingId === scheme.id ? null : scheme.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-lg text-xs font-bold border border-violet-100 hover:bg-violet-100 transition"
                                                    >
                                                        <BrainCircuit className="w-3 h-3" /> Explain with AI
                                                    </button>
                                                    <a href={scheme.link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 hover:bg-blue-100 transition">
                                                        Official Portal <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                    <button
                                                        onClick={() => setEligibilityCheck(eligibilityCheck === scheme.id ? null : scheme.id)}
                                                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold border border-gray-100 hover:text-green-600 transition"
                                                    >
                                                        Review Documents
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Benefit Side Area */}
                                            <div className="md:w-1/3 bg-gray-50 rounded-xl p-4 flex flex-col justify-center items-center text-center border border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Benefit Value</span>
                                                <div className="text-2xl font-extrabold text-gray-800 mb-1">{scheme.benefitAmount}</div>
                                                <p className="text-[10px] text-gray-500">Direct Bank Transfer / Subsidy</p>

                                                {/* Eligibility Indicator */}
                                                <div className="mt-4 w-full pt-4 border-t border-gray-200">
                                                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 py-1.5 rounded-lg border border-green-100">
                                                        <CheckCircle className="w-3 h-3" /> You are Eligible
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Explanation Accordion */}
                                        <AnimatePresence>
                                            {explainingId === scheme.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-violet-50/50 mt-4 p-4 rounded-xl border border-violet-100 text-sm text-gray-700 relative">
                                                        <div className="absolute top-0 left-4 -translate-y-1/2 bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px] font-bold">AI Agent Summary</div>
                                                        <p className="mb-2"><span className="font-bold">What is this?</span> This is a government scheme to help {scheme.category === 'Loan' ? 'with farming costs' : 'support your income'}.</p>
                                                        <p className="mb-2"><span className="font-bold">What you get:</span> {scheme.benefitAmount} directly to your account.</p>
                                                        <p><span className="font-bold">Next Step:</span> Keep your {scheme.documents[0]} ready and visit the official link.</p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Documents Accordion */}
                                        <AnimatePresence>
                                            {eligibilityCheck === scheme.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="bg-gray-50 mt-4 p-4 rounded-xl border border-gray-200 border-dashed">
                                                        <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Required Documents</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {scheme.documents.map((doc, i) => (
                                                                <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600 flex items-center gap-1">
                                                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> {doc}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="mt-3 text-xs text-gray-500">Apply at: <span className="underline">Common Service Center (CSC)</span> or Online.</div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
