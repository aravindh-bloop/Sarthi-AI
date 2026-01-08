import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Upload, Camera, CheckCircle, AlertTriangle, Loader2,
    Sprout, MapPin, FileText,
    Activity, ArrowRight, History, Share2, AlertOctagon,
    TrendingUp, Ticket, CheckSquare,
    TrendingDown, CloudRain, BrainCircuit, Bell, Download,
    Clock
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

// --- Types ---

interface CropContext {
    cropName: string;
    growthStage: string;
    fieldId: string;
}

interface AnalysisResult {
    id: string;
    date: Date;
    diseaseName: string;
    severity: 'Low' | 'Medium' | 'High';
    confidence: number;
    affectedArea: 'Leaf' | 'Stem' | 'Fruit' | 'Root';
    riskFlag: 'Monitor' | 'Needs Attention' | 'Critical';
    aiExplanation: string;
    recommendations: string[];
    advisory: {
        title: string;
        description: string;
        type: 'warning' | 'info' | 'critical';
    };
    ticketId?: string;
}

interface SupportTicket {
    id: string;
    issue: string;
    crop: string;
    severity: 'High' | 'Critical';
    officer: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    dateRaised: string;
    lastUpdate: string;
}

interface TimelineEvent {
    id: string;
    date: string;
    type: 'scan' | 'action' | 'weather' | 'escalation' | 'reminder';
    title: string;
    subtitle?: string;
    description?: string;
    image?: string;
    severity?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Healthy';
    score?: number;
    metadata?: {
        weather?: string;
        agentNote?: string;
        ticketId?: string;
    };
}

// --- Mock Data ---

const FIELDS = [
    { id: 'f1', name: 'Plot A - North (Tomato)' },
    { id: 'f2', name: 'Plot B - East (Wheat)' },
    { id: 'f3', name: 'Greenhouse 1 (Peppers)' },
];


// --- Main Component ---

export default function CropHealthPage() {
    const [viewMode, setViewMode] = useState<'diagnosis' | 'monitoring'>('diagnosis');
    const [step, setStep] = useState<'upload' | 'context' | 'analyzing' | 'result'>('upload');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [context, setContext] = useState<CropContext>({ cropName: '', growthStage: '', fieldId: '' });
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [error, setError] = useState<string | null>(null);

    const resultRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to result when it appears
    useEffect(() => {
        if (step === 'result' && resultRef.current) {
            // Small timeout to ensure render is complete
            setTimeout(() => {
                resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    }, [step]);

    // Mock Data for Tickets
    const MOCK_TICKETS: SupportTicket[] = [
        { id: 'tkt1', issue: 'Leaf Blight', crop: 'Tomato', severity: 'High', officer: 'Rajesh Kumar', status: 'In Progress', dateRaised: 'Oct 24, 2025', lastUpdate: 'Officer assigned' },
        { id: 'tkt2', issue: 'Stem Borer', crop: 'Maize', severity: 'Critical', officer: 'Pending', status: 'Open', dateRaised: 'Oct 27, 2025', lastUpdate: 'Waiting for review' }
    ];

    // Fetch Tickets (API)
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setError(null);
                const res = await fetch('/api/tickets');
                if (res.ok) {
                    const data = await res.json();
                    setTickets(data);
                } else {
                    throw new Error("Backend API unavailable");
                }
            } catch (err) {
                console.warn("Backend unavailable. Using Demo Mock Data for Tickets.");
                setTickets(MOCK_TICKETS);
            }
        };
        fetchTickets();
        const interval = setInterval(fetchTickets, 30000);
        return () => clearInterval(interval);
    }, []);

    // Removed the blocking error return logic to ensure UI always loads
    // if (error && tickets.length === 0) { ... } logic removed

    const [isRaisingTicket, setIsRaisingTicket] = useState(false);
    const [selectedField, setSelectedField] = useState('f1');

    const TIMELINE_DATA: TimelineEvent[] = [
        {
            id: 't1',
            date: 'Oct 30, 2025',
            type: 'scan',
            title: 'Late Blight Detection',
            subtitle: `Severity: Medium · Confidence: 89%`,
            description: 'AI detected early signs of fungal infection on Tomato leaves.',
            image: 'https://images.unsplash.com/photo-1591040361093-27cc6e42b202?auto=format&fit=crop&q=80&w=150&h=150',
            severity: 'Medium',
            score: 65,
            metadata: {
                weather: 'Humid, 28°C',
                agentNote: 'Matches seasonal pattern from 2024.'
            }
        },
        {
            id: 't2',
            date: 'Oct 28, 2025',
            type: 'reminder',
            title: 'Fungicide Application Due',
            subtitle: 'Recommended: Mancozeb feeding',
            description: 'Scheduled follow-up after the last rain cycle.',
            severity: 'Low'
        },
        {
            id: 't3',
            date: 'Oct 26, 2025',
            type: 'action',
            title: 'Pruning Completed',
            subtitle: 'Affected leaves removed',
            description: 'Manual removal of infected foliage to prevent spread.',
        },
        {
            id: 't4',
            date: 'Oct 24, 2025',
            type: 'escalation',
            title: 'Expert Consultation Requested',
            subtitle: 'Ticket #TKT-2025-001',
            description: 'Issue escalated to regional agronomist for verification.',
            metadata: { ticketId: 'TKT-2025-001' }
        },
        {
            id: 't5',
            date: 'Oct 24, 2025',
            type: 'scan',
            title: 'High Pathogen Pressure Alert',
            subtitle: `Severity: High · Confidence: 94%`,
            description: 'Heavy moisture and warmth increased viral risk factors.',
            image: 'https://images.unsplash.com/photo-1518977676651-71f6480bc58c?auto=format&fit=crop&q=80&w=150&h=150',
            severity: 'High',
            score: 42,
            metadata: {
                weather: 'Heavy Rain (3 Days)'
            }
        },
        {
            id: 't6',
            date: 'Oct 21, 2025',
            type: 'weather',
            title: 'Heavy Rainfall Logged',
            subtitle: 'Field saturation 100%',
            description: '3-day rain event likely washed away protective sprays.',
        },
        {
            id: 't7',
            date: 'Oct 15, 2025',
            type: 'scan',
            title: 'Routine Health Check',
            subtitle: `Severity: Healthy`,
            description: 'Biomass index and leaf color within optimal range.',
            image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=150&h=150',
            severity: 'Healthy',
            score: 95
        }
    ];

    // Handlers
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setSelectedImage(imageUrl);
            setStep('context');
        }
    };

    const handleContextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStep('analyzing');
        try {
            const response = await fetch('/api/analyze-crop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(context)
            });
            const data = await response.json();
            setResult(data);
            setStep('result');
        } catch (error) {
            console.error("Analysis Failed", error);
            // Handle error (maybe setStep back to context or show error)
            setStep('context');
            alert("Analysis failed. Please try again.");
        }
    };

    const handleRaiseTicket = () => {
        if (!result) return;
        setIsRaisingTicket(true);
        setTimeout(() => {
            const newTicket: SupportTicket = {
                id: `TKT-2026-${Math.floor(Math.random() * 1000)}`,
                issue: result.diseaseName,
                crop: context.cropName || 'Unknown Crop',
                severity: result.severity === 'High' ? 'Critical' : 'High',
                officer: 'Pending Assignment',
                status: 'Open',
                dateRaised: 'Just Now',
                lastUpdate: 'Ticket created.'
            };
            setTickets([newTicket, ...tickets]);
            setResult({ ...result, ticketId: newTicket.id });
            setIsRaisingTicket(false);
        }, 1500);
    };

    const resetAnalysis = () => {
        setSelectedImage(null);
        setStep('upload');
        setResult(null);
        setContext({ cropName: '', growthStage: '', fieldId: '' });
    };

    return (
        <DashboardLayout>
            <div className={clsx("relative flex flex-col", viewMode === 'diagnosis' ? "h-[calc(100vh-80px)] overflow-hidden" : "min-h-screen")}>
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className={clsx("relative z-10 p-3 md:p-4 max-w-[1600px] mx-auto w-full", viewMode === 'diagnosis' ? "flex-1 flex flex-col min-h-0" : "space-y-8")}>

                    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-green-200/50 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-1">Health Intelligence</h1>
                                <div className="flex items-center gap-2">
                                    <span className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Real-Time AI Diagnostic Hub</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex bg-white/40 backdrop-blur-xl p-1 rounded-2xl border border-white/60 shadow-lg shadow-slate-200/20">
                            {[
                                { id: 'diagnosis', label: 'AI Scanner', icon: Camera },
                                { id: 'monitoring', label: 'Dashboard', icon: TrendingUp }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id as any)}
                                    className={clsx(
                                        "px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-2",
                                        viewMode === tab.id
                                            ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-[1.02]"
                                            : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {viewMode === 'diagnosis' ? (
                        <div className="flex-1 flex flex-col gap-4 min-h-0 overflow-y-auto pb-20 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                            {/* Diagnostic Command Center - Full Width Stack */}
                            <div className="w-full flex flex-col gap-4">

                                {/* Step 1: Upload (Ultra-Compact & Fixed) */}
                                {step === 'upload' && (
                                    <div className="w-full flex items-center justify-center">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/60 shadow-2xl shadow-slate-200/40 text-center relative overflow-hidden group/upload w-full"
                                        >
                                            <div className="absolute -top-10 -right-10 opacity-5">
                                                <Sprout className="w-32 h-32 -rotate-12" />
                                            </div>

                                            <div className="relative z-10 max-w-4xl mx-auto">
                                                <div className="w-16 h-16 bg-gradient-to-br from-green-500/10 to-emerald-500/10 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover/upload:scale-105 transition-transform duration-500">
                                                    <Camera className="w-8 h-8" />
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-800 mb-1 tracking-tight">Health Diagnostic Hub</h3>
                                                <p className="text-slate-500 mb-6 text-base font-bold opacity-60">Deploy Sarthi AI to identify localized crop threats instantly</p>

                                                <div className="flex flex-col items-center">
                                                    <label className="group/btn cursor-pointer relative inline-flex items-center justify-center px-10 py-5 bg-slate-900 text-white font-black rounded-2xl overflow-hidden transition-all hover:scale-[1.02] shadow-2xl shadow-slate-900/40 active:scale-95">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                                        <span className="relative flex items-center gap-4 text-xl uppercase tracking-[0.2em] font-black">
                                                            <Upload className="w-6 h-6" />
                                                            Initiate Scanner
                                                        </span>
                                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                                    </label>

                                                    <div className="mt-8 pt-6 border-t border-slate-100 w-full flex items-center justify-around max-w-sm mx-auto">
                                                        <div className="text-center">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Precision</div>
                                                            <div className="text-lg font-black text-slate-800">98.2%</div>
                                                        </div>
                                                        <div className="w-px h-8 bg-slate-100" />
                                                        <div className="text-center">
                                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Latency</div>
                                                            <div className="text-lg font-black text-slate-800">&lt; 2s</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                                {/* Step 2: Context Input (Redesigned) */}
                                {step === 'context' && (
                                    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-white/60 overflow-hidden">
                                        <div className="p-10">
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                                {/* Left: Preview */}
                                                <div className="lg:col-span-5">
                                                    <div className="relative group aspect-square">
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-3xl z-10" />
                                                        <img src={selectedImage!} alt="Preview" className="w-full h-full object-cover rounded-[2rem] shadow-2xl border-4 border-white" />
                                                        <div className="absolute bottom-6 left-6 z-20">
                                                            <button onClick={() => setStep('upload')} className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl text-white text-xs font-bold hover:bg-white/40 transition-colors border border-white/30">
                                                                <Camera className="w-4 h-4" /> Change Source Photo
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Right: Form */}
                                                <div className="lg:col-span-7 flex flex-col justify-center">
                                                    <div className="mb-8">
                                                        <h3 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Refine Context</h3>
                                                        <p className="text-slate-500 text-sm leading-relaxed font-medium">Precision diagnosis requires environmental context. Tell us where this was taken.</p>
                                                    </div>

                                                    <form onSubmit={handleContextSubmit} className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Crop Variety</label>
                                                                <div className="relative">
                                                                    <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                    <select required className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-slate-700 transition-all hover:bg-white cursor-pointer appearance-none" value={context.cropName} onChange={e => setContext({ ...context, cropName: e.target.value })}>
                                                                        <option value="">Select Crop</option><option value="Wheat">Wheat</option><option value="Rice">Rice</option><option value="Tomato">Tomato</option><option value="Cotton">Cotton</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Growth Stage</label>
                                                                <div className="relative">
                                                                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                    <select required className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-slate-700 transition-all hover:bg-white cursor-pointer appearance-none" value={context.growthStage} onChange={e => setContext({ ...context, growthStage: e.target.value })}>
                                                                        <option value="">Select Stage</option><option value="Seedling">Seedling</option><option value="Vegetative">Vegetative</option><option value="Flowering">Flowering</option><option value="Fruiting">Fruiting</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Field Assignment</label>
                                                            <div className="relative">
                                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                                                <select required className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-slate-700 transition-all hover:bg-white cursor-pointer appearance-none" value={context.fieldId} onChange={e => setContext({ ...context, fieldId: e.target.value })}>
                                                                    <option value="">Select Target Field / Plot</option>{FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <button type="submit" className="w-full group relative overflow-hidden bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/30 hover:shadow-green-900/20 transition-all hover:-translate-y-1 active:translate-y-0 mt-4 flex items-center justify-center gap-3">
                                                            Analyze Integrated Data
                                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Step 3: Analyzing */}
                                {step === 'analyzing' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center min-h-[400px]">
                                        <div className="relative mb-8">
                                            <div className="w-24 h-24 border-4 border-green-100 rounded-full animate-pulse" />
                                            <div className="absolute inset-0 border-4 border-t-green-600 rounded-full animate-spin" />
                                            <Sprout className="absolute inset-0 m-auto w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Analyzing Health Data</h3>
                                        <p className="text-gray-500 max-w-sm">Our AI is scanning the image for visual symptoms and correlating with field data...</p>
                                    </motion.div>
                                )}

                                {/* Step 4: Result Panel (Ultra-Premium Redesign) */}
                                {step === 'result' && result && (
                                    <motion.div ref={resultRef} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-6">

                                        {/* Primary Insight Card */}
                                        <div className="bg-white/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 shadow-2xl shadow-slate-200/50 overflow-hidden">
                                            <div className="flex flex-col xl:flex-row min-h-[300px]">
                                                {/* Image Canvas */}
                                                <div className="xl:w-80 relative group h-64 xl:h-auto shrink-0 p-4">
                                                    <img src={selectedImage!} alt="Analyzed" className="w-full h-full rounded-[2rem] object-cover shadow-2xl border-4 border-white" />
                                                    <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-xl text-white px-3 py-1 text-[10px] font-black uppercase rounded-full border border-white/20 tracking-[0.2em] shadow-lg">Analyzed Image</div>
                                                </div>

                                                {/* Diagnostics Content */}
                                                <div className="flex-1 p-8 xl:p-10 flex flex-col justify-center">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div>
                                                            <div className="flex flex-wrap items-center gap-3 mb-3">
                                                                <span className={clsx(
                                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white shadow-sm border",
                                                                    result.severity === 'High' ? "text-red-600 border-red-100" : result.severity === 'Medium' ? "text-amber-600 border-amber-100" : "text-green-600 border-green-100"
                                                                )}>
                                                                    {result.severity} Risk Potential
                                                                </span>
                                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/5 rounded-full border border-slate-900/5">
                                                                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{result.confidence}% Confidence</span>
                                                                </div>
                                                            </div>
                                                            <h2 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">{result.diseaseName}</h2>
                                                        </div>

                                                        <div className="flex gap-2">
                                                            <button onClick={resetAnalysis} className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200/50 rounded-2xl transition-all shadow-sm active:scale-95" title="Restart Scan">
                                                                <Camera className="w-5 h-5" />
                                                            </button>
                                                            <button className="p-3 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 border border-slate-200/50 rounded-2xl transition-all shadow-sm active:scale-95" title="Export Diagnostic">
                                                                <Share2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="bg-slate-900 rounded-3xl p-6 shadow-2xl relative overflow-hidden group/insight">
                                                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent pointer-events-none" />
                                                        <div className="relative flex items-start gap-4">
                                                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shrink-0 ring-1 ring-white/10">
                                                                <BrainCircuit className="w-6 h-6 text-green-400" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1.5 uppercase tracking-wide">AI Diagnostic Insight</h4>
                                                                <p className="text-gray-200 text-sm leading-relaxed font-medium">{result.aiExplanation}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Strategy Grid */}
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* Left: Recommended Plan */}
                                            <div className="bg-white/80 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/60 shadow-xl shadow-slate-200/40">
                                                <div className="flex items-center gap-4 mb-8">
                                                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl shadow-inner"><CheckCircle className="w-6 h-6" /></div>
                                                    <h4 className="font-black text-slate-800 text-xl tracking-tight">Strategy Plan</h4>
                                                </div>
                                                <div className="space-y-4">
                                                    {result.recommendations.map((rec, i) => (
                                                        <div key={i} className="flex gap-4 items-start group p-4 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-slate-100 hover:shadow-sm">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-green-600 group-hover:text-white transition-all">
                                                                {i + 1}
                                                            </div>
                                                            <p className="text-sm text-slate-600 font-bold group-hover:text-slate-900 transition-colors leading-relaxed">
                                                                {rec}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right: Risk & Actions */}
                                            <div className="space-y-6">
                                                <div className={clsx(
                                                    "rounded-[2.5rem] p-8 border relative overflow-hidden shadow-xl",
                                                    result.advisory.type === 'critical' ? "bg-red-50/80 border-red-100" : "bg-amber-50/80 border-amber-100"
                                                )}>
                                                    <div className="absolute -right-8 -top-8 opacity-5"><AlertOctagon className="w-48 h-48" /></div>
                                                    <div className="flex items-center gap-3 mb-4 relative z-10">
                                                        <div className={clsx("p-2 rounded-xl", result.advisory.type === 'critical' ? "bg-red-200/50 text-red-700" : "bg-amber-200/50 text-amber-700")}>
                                                            <AlertOctagon className="w-5 h-5" />
                                                        </div>
                                                        <h4 className={clsx("font-black text-lg tracking-tight", result.advisory.type === 'critical' ? "text-red-900" : "text-amber-900")}>
                                                            {result.advisory.title}
                                                        </h4>
                                                    </div>
                                                    <p className={clsx("text-sm font-bold leading-relaxed relative z-10 opacity-80", result.advisory.type === 'critical' ? "text-red-800" : "text-amber-800")}>
                                                        {result.advisory.description}
                                                    </p>
                                                </div>

                                                <div className="bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group/actions">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-green-600/10 pointer-events-none" />
                                                    <div className="flex items-center gap-4 mb-8">
                                                        <div className="p-3 bg-white/10 text-blue-400 rounded-2xl"><Activity className="w-5 h-5" /></div>
                                                        <h4 className="font-black text-white text-lg tracking-tight">Smart Resolution</h4>
                                                    </div>

                                                    <div className="space-y-4 relative z-10">
                                                        {(result.severity === 'High' || result.severity === 'Medium') && !result.ticketId && (
                                                            <button onClick={handleRaiseTicket} disabled={isRaisingTicket} className="w-full py-4 px-6 bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-2xl text-sm font-black transition-all flex items-center justify-between group active:scale-95">
                                                                <span className="flex items-center gap-3">
                                                                    {isRaisingTicket ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ticket className="w-5 h-5 text-red-400" />}
                                                                    {isRaisingTicket ? 'Locating expert...' : 'Consult Human Agronomist'}
                                                                </span>
                                                                <ArrowRight className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />
                                                            </button>
                                                        )}
                                                        {result.ticketId && (
                                                            <div className="w-full py-4 px-6 bg-green-500/10 text-green-400 border border-green-500/20 rounded-2xl text-sm font-black flex items-center gap-3">
                                                                <CheckSquare className="w-5 h-5" /> Ticket Deployed (ID: {result.ticketId})
                                                            </div>
                                                        )}
                                                        <button className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 hover:border-white/20 rounded-2xl text-sm font-black transition-all flex items-center justify-between active:scale-95 group">
                                                            <span className="flex items-center gap-3">
                                                                <FileText className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                                                                Log to Field Journal
                                                            </span>
                                                            <CheckCircle className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* AI Intelligence Hub - Full Width Section */}
                            <div className="w-full">
                                {/* Intelligence Engine Card (Ultra-Wide) */}
                                <div className="bg-slate-900 rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden group/engine">
                                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] -mr-40 -mt-40" />
                                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -ml-40 -mb-40" />

                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                                <BrainCircuit className="w-8 h-8 text-green-400" />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-xl tracking-tight">AI Agent Status</h4>
                                                <p className="text-slate-400 font-bold text-[10px] tracking-wide uppercase mt-1">Sarthi Engine v2.4.0 • Active Cluster</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                            {[
                                                { label: "Vision Processing", status: "Active", color: "text-blue-400", desc: "Image Analysis" },
                                                { label: "Pattern Recognition", status: "Active", color: "text-emerald-400", desc: "Disease ID" },
                                                { label: "Field Correlation", status: "Syncing", color: "text-amber-400", desc: "Context Mapping" }
                                            ].map((node, i) => (
                                                <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all duration-500 cursor-pointer group/node">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-[9px] font-black text-gray-400 tracking-widest uppercase">{node.label}</span>
                                                        <div className="flex items-center gap-1.5">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${node.color} bg-current animate-pulse`} />
                                                            <span className={`text-[8px] font-black uppercase tracking-widest ${node.color}`}>{node.status}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[11px] font-bold text-slate-300 opacity-60 group-hover/node:opacity-100 transition-opacity">{node.desc}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // --- LONGITUDINAL MONITORING VIEW ---
                        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">

                            {/* 1. Header & Filters */}
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                                <div className="w-full md:w-auto flex items-center gap-3">
                                    <span className="text-gray-500 font-medium">Monitoring View:</span>
                                    <select
                                        value={selectedField}
                                        onChange={(e) => setSelectedField(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 font-bold text-gray-800 outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
                                    <Download className="w-4 h-4" /> Download Health Report
                                </button>
                            </div>

                            {/* 2. Key Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Field Health Score</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl font-extrabold text-gray-900 border-l-4 border-yellow-400 pl-3">65/100</div>
                                        <div className="text-xs text-yellow-600 font-bold bg-yellow-50 px-2 py-1 rounded-full">Fair Condition</div>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 mt-4 rounded-full overflow-hidden">
                                        <div className="bg-yellow-400 h-full rounded-full" style={{ width: '65%' }}></div>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Severity Trend</h3>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-lg"><TrendingDown className="w-6 h-6" /></div>
                                        <div>
                                            <div className="font-bold text-red-700">Worsening</div>
                                            <div className="text-xs text-gray-500">Last 10 Days</div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Recent spike in Fungal issues
                                    </p>
                                </div>

                                <div className="bg-gradient-to-br from-violet-600 to-purple-700 p-6 rounded-2xl text-white shadow-lg shadow-violet-500/20 col-span-1 md:col-span-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-lg flex items-center gap-2 mb-2"><BrainCircuit className="w-5 h-5" /> AI field Insights</h3>
                                            <p className="text-sm opacity-90 leading-relaxed max-w-lg">
                                                "This field showed similar <span className="font-bold text-white border-b border-white/30">Early Blight</span> symptoms last season during this exact week of heavy rains. The recurrence suggests a need for <span className="font-bold text-white border-b border-white/30">preventative fungicide scheduling</span> in October."
                                            </p>
                                        </div>
                                        <Bell className="w-6 h-6 opacity-50" />
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                        <div className="text-[10px] bg-white/20 px-2 py-1 rounded font-medium">Correlation: high humidity</div>
                                        <div className="text-[10px] bg-white/20 px-2 py-1 rounded font-medium">Risk: Recurrent</div>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Longitudinal Timeline */}
                            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                                <div className="p-8 md:w-2/3 border-r border-gray-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <History className="w-5 h-5 text-green-600" /> Historical Health Timeline
                                    </h3>

                                    <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
                                        {TIMELINE_DATA.map(event => (
                                            <div key={event.id} className="relative">
                                                {/* Timeline Node */}
                                                <div className={clsx(
                                                    "absolute -left-[29px] w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                                                    event.severity === 'Critical' || event.severity === 'High' ? "bg-red-500" :
                                                        event.severity === 'Medium' ? "bg-orange-400" :
                                                            event.severity === 'Low' || event.severity === 'Healthy' ? "bg-green-500" : "bg-blue-500"
                                                )}>
                                                    <div className="w-2 h-2 bg-white rounded-full" />
                                                </div>

                                                <div className="flex flex-col sm:flex-row gap-4">
                                                    {event.image && (
                                                        <img src={event.image} alt="Event" className="w-24 h-24 rounded-xl object-cover border border-gray-200 shadow-sm shrink-0" />
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">{event.date}</span>
                                                            <span className={clsx("px-2 py-0.5 text-[10px] font-bold rounded-md uppercase",
                                                                event.type === 'scan' ? "bg-blue-50 text-blue-600" :
                                                                    event.type === 'weather' ? "bg-gray-100 text-gray-600" :
                                                                        event.type === 'escalation' ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"
                                                            )}>{event.type}</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-800 text-base">{event.title}</h4>
                                                        <p className="text-sm font-medium text-gray-500 mb-2">{event.subtitle}</p>

                                                        {event.description && (
                                                            <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-600 leading-relaxed border border-gray-100">
                                                                {event.description}
                                                            </div>
                                                        )}

                                                        {event.metadata?.weather && (
                                                            <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-500 font-medium">
                                                                <CloudRain className="w-3 h-3" /> context: {event.metadata.weather}
                                                            </div>
                                                        )}
                                                        {event.type === 'reminder' && (
                                                            <button className="mt-2 text-xs font-bold text-green-600 border border-green-200 px-3 py-1 rounded-full hover:bg-green-50 transition">
                                                                Verify & Resolve Alert
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 text-center">
                                        <button className="text-sm font-medium text-gray-500 hover:text-green-600 transition">View Full Timeline History</button>
                                    </div>
                                </div>

                                <div className="p-6 md:w-1/3 bg-gray-50/50">
                                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Correlation Factors</h3>

                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CloudRain className="w-5 h-5 text-blue-500" />
                                                <span className="font-bold text-gray-700">Weather Impact</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Disease severity spike correlates strongly with the 3-day heavy rainfall event on Oct 21.
                                            </p>
                                        </div>

                                        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckSquare className="w-5 h-5 text-green-500" />
                                                <span className="font-bold text-gray-700">Task Completion</span>
                                            </div>
                                            <p className="text-xs text-gray-500 leading-relaxed">
                                                Fungicide application was delayed by 2 days, potentially allowing 'High' severity progression.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                        <h4 className="font-bold text-blue-800 text-sm mb-2 flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Upcoming Checkups
                                        </h4>
                                        <div className="flex justify-between items-center text-xs text-blue-700 mb-1">
                                            <span>Follow-up Scan</span>
                                            <span className="font-bold">Oct 28</span>
                                        </div>
                                        <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2">
                                            <div className="bg-blue-500 h-full rounded-full" style={{ width: '80%' }}></div>
                                        </div>
                                        <div className="text-[10px] text-blue-400 mt-1 text-right">In 2 days</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div >
        </DashboardLayout >
    );
}
