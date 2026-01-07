import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Calendar as CalendarIcon, List, Plus,
    ChevronLeft, ChevronRight, Sprout, Droplets, Leaf,
    Scissors, Download, CheckCircle, AlertTriangle,
    Info, DollarSign, MoreHorizontal, PanelRightClose, PanelRightOpen, PanelLeftClose, PanelLeftOpen,
    Search, X, ChevronDown, ChevronUp, HelpCircle, BrainCircuit, Activity, Clock as ClockIcon
} from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
// CROP_CALENDAR_DETAILS removed in favor of API


// --- Types & Interfaces ---

interface Task {
    id: string;
    plotId: string;
    type: 'sowing' | 'irrigation' | 'fertilization' | 'scouting' | 'harvesting' | 'protection' | 'general';
    title: string;
    date: Date;
    status: 'done' | 'pending' | 'upcoming' | 'risk';
    cost: number;
    alert?: string;
    severity?: 'low' | 'medium' | 'high';
    isAISuggestion?: boolean; // New filtering capability
}

interface Plot {
    id: string;
    name: string;
    crop: string;
    size: string;
    soil: string;
    irrigation: string;
    image: string; // Emoji as image for now
}

interface AISuggestion {
    id: string;
    type: 'reschedule' | 'optimization' | 'intercropping';
    text: string;
    reasoning: string;
    originalDate?: string;
    impact?: string; // e.g. "Save ₹200"
}

// --- Mock Data ---

// MOCK DATA REMOVED - using API
// const PLOTS = ...
// const MOCK_TASKS = ...
// const AI_SUGGESTIONS = ... (Still mock or fetched? We'll leave AI mock for now as per plan, but Plots/Tasks move)

// We will keep AI_SUGGESTIONS as mock for now or move it if needed.
const AI_SUGGESTIONS: AISuggestion[] = [
    { id: 'ai1', type: 'reschedule', text: 'Moved Wheat Sowing to Jan 5', reasoning: 'Heavy rain (40mm) predicted on Jan 4 would wash away seeds.', originalDate: 'Jan 4' },
    { id: 'ai2', type: 'optimization', text: 'Reduce Urea by 10% in Plot B', reasoning: 'Recent soil sensor data shows sufficient Nitrogen levels from last crop.', impact: 'Save ₹350' },
    { id: 'ai3', type: 'intercropping', text: 'Plant Marigold in Plot C', reasoning: 'Marigolds naturally repel nematodes which frequently attack Tomato plants.', impact: 'Reduce pesticide cost' },
];

const MOCK_PLOTS: Plot[] = [
    { id: 'plot_a', name: 'Field A (North)', crop: 'Wheat', size: '2.5 Acres', soil: 'Loamy', irrigation: 'Drip', image: '🌾' },
    { id: 'plot_b', name: 'Field B (South)', crop: 'Mustard', size: '1.2 Acres', soil: 'Clay', irrigation: 'Sprinkler', image: '🌱' },
    { id: 'plot_c', name: 'Orchard 1', crop: 'Mango', size: '4 Acres', soil: 'Red', irrigation: 'Drip', image: '🌳' },
];

// --- Main Application ---

export default function PlannerPage() {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>(window.innerWidth < 768 ? 'list' : 'calendar');
    const [selectedPlot, setSelectedPlot] = useState<string>('all');
    const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)); // Jan 2026
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIPanel, setShowAIPanel] = useState(false); // Default hidden on mobile? layout handles it
    // Effect to handle resize
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && viewMode !== 'list') setViewMode('list');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [viewMode]);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>({ key: 'date', direction: 'asc' });
    const [aiFilterOnly, setAiFilterOnly] = useState(false);
    const [cropDetails, setCropDetails] = useState<any[]>([]);

    // State for Real Data
    const [plots, setPlots] = useState<Plot[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Fetch All Data needed for Planner
    // Real-time Listeners for Planner Data
    React.useEffect(() => {
        // 1. Crops Listener
        const unsubCrops = onSnapshot(collection(db, 'crop_calendar'), (snap) => {
            const crops = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setCropDetails(crops);
        });

        // 2. Plots Listener
        const unsubPlots = onSnapshot(collection(db, 'plots'), (snap) => {
            const plotsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plot));
            // Merge Mock Plots for Demo
            const mergedPlots = [...plotsData, ...MOCK_PLOTS.filter(mp => !plotsData.find(p => p.id === mp.id))];
            setPlots(mergedPlots);
        });

        // 3. Tasks Listener
        const unsubTasks = onSnapshot(collection(db, 'tasks'), (snap) => {
            const tasksData = snap.docs.map((doc, index) => {
                const data = doc.data();
                const taskDate = new Date(data.date);
                let taskPlotId = data.plotId;

                // DEMO: Assign Mock Plots to tasks from Jan (0) to May (4)
                if (taskDate.getMonth() <= 4) {
                    taskPlotId = MOCK_PLOTS[index % MOCK_PLOTS.length].id;
                }

                return {
                    ...data,
                    id: doc.id,
                    date: taskDate,
                    plotId: taskPlotId
                } as Task;
            });
            setTasks(tasksData);
            console.log(`Planner Data Loaded: ${tasksData.length} tasks synced.`);
        });

        return () => {
            unsubCrops();
            unsubPlots();
            unsubTasks();
        };
    }, []);

    // Deduplicate plots by name
    const uniquePlots = React.useMemo(() => {
        const seen = new Set();
        return plots.filter(p => {
            if (seen.has(p.name)) return false;
            seen.add(p.name);
            return true;
        });
    }, [plots]);

    // Modal State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

    // Collapsible Panels State
    const [openPanels, setOpenPanels] = useState({
        ai: true,
        risk: true,
        budget: true
    });

    const togglePanel = (panel: 'ai' | 'risk' | 'budget') => {
        setOpenPanels(prev => ({ ...prev, [panel]: !prev[panel] }));
    };

    // Filter Logic
    const filteredTasks = tasks.filter(t => {
        const matchesPlot = selectedPlot === 'all' || t.plotId === selectedPlot;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesAi = aiFilterOnly ? t.isAISuggestion : true;
        return matchesPlot && matchesSearch && matchesAi;
    });

    // Sorting Logic (for list view)
    const sortedTasks = React.useMemo(() => {
        if (!sortConfig) return filteredTasks;
        return [...filteredTasks].sort((a: any, b: any) => {
            if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
            if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTasks, sortConfig]);

    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // ... inside PlannerPage component
    const currentMonthStr = format(currentMonth, 'MMMM');

    // Helper: Dynamic Season Info
    const seasonInfo = React.useMemo(() => {
        const sowingCrops = cropDetails.filter(c => c.sowingMonths.includes(currentMonthStr));
        const harvestingCrops = cropDetails.filter(c => c.harvestMonths.includes(currentMonthStr));

        let season = "Off-Season";
        const allActive = [...sowingCrops, ...harvestingCrops];
        if (allActive.length > 0) {
            const counts = allActive.reduce((acc, curr) => {
                acc[curr.season] = (acc[curr.season] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            season = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }
        return { season, sowingCount: sowingCrops.length, harvestCount: harvestingCrops.length };
    }, [currentMonthStr]);

    // --- Dynamic Strategy Logic ---
    const strategy = React.useMemo(() => {
        const monthName = format(currentMonth, 'MMMM').toLowerCase();
        // Fallback for completion rates which were hardcoded
        const completionRates: Record<string, number> = {
            'january': 84, 'february': 78, 'march': 92, 'april': 95,
            'may': 88, 'june': 72, 'july': 81, 'august': 86,
            'september': 90, 'october': 83, 'november': 87, 'december': 94
        };

        return {
            objective: t(`strategies.${monthName}.objective`),
            desc: t(`strategies.${monthName}.desc`),
            completion: completionRates[monthName] || 85
        };
    }, [currentMonth, t]);

    const agentLog = React.useMemo(() => {
        const index = currentMonth.getMonth() % 8; // 8 logs in array
        return `> ${t(`planner.agent.logs.${index}`)}`;
    }, [currentMonth, t]);

    const handleExport = () => {
        const monthTasks = filteredTasks.filter(t =>
            t.date.getMonth() === currentMonth.getMonth() &&
            t.date.getFullYear() === currentMonth.getFullYear()
        );

        const exportData = {
            metadata: {
                app: "KrishiSetu",
                version: "2.1-Beta",
                generatedAt: new Date().toISOString(),
                userContext: "Planner Export"
            },
            planPeriod: {
                month: format(currentMonth, 'MMMM'),
                year: format(currentMonth, 'yyyy'),
                season: seasonInfo.season
            },
            strategicDirective: {
                objective: strategy.objective,
                description: strategy.desc,
                completionStatus: `${strategy.completion}%`
            },
            summary: {
                totalTasks: monthTasks.length,
                pendingTasks: monthTasks.filter(t => t.status === 'pending' || t.status === 'upcoming').length,
                totalEstimatedCost: monthTasks.reduce((sum, t) => sum + (t.cost || 0), 0),
                currency: "INR"
            },
            tasks: monthTasks.map(t => ({
                id: t.id,
                date: format(t.date, 'yyyy-MM-dd'),
                title: t.title,
                type: t.type,
                status: t.status,
                plot: plots.find(p => p.id === t.plotId)?.name || 'Unknown Plot',
                cost: t.cost,
                alerts: t.alert || null,
                isAiGenerated: !!t.isAISuggestion
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `KrishiSetu_Plan_${format(currentMonth, 'MMM_yyyy')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <DashboardLayout>
            <div
                className="min-h-screen relative pb-20 flex flex-col bg-cover bg-center bg-fixed"
                style={{ backgroundImage: "url('/assets/images/dashboard-bg.jpg')" }}
            >
                {/* Overlay for better text readability */}
                <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-0 pointer-events-none" />

                {/* Top Bar */}
                <header className="relative z-20 bg-white/40 backdrop-blur-xl border-b border-white/60 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
                    <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setShowLeftPanel(!showLeftPanel)}
                                className="p-2 hover:bg-white/50 rounded-lg text-gray-500 transition-colors hidden lg:block"
                                title={showLeftPanel ? t('planner.toggleSidebar') : t('planner.toggleSidebar')}
                            >
                                {showLeftPanel ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                            </button>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tight">
                                    {t('planner.hero.title')}
                                    <div className="flex -space-x-1 items-center ml-2">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center shadow-sm relative z-10">
                                            <BrainCircuit className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="px-3 py-1 bg-gray-900 text-[10px] text-white font-mono rounded-r-full pl-4 shadow-sm border border-gray-800">
                                            {t('planner.hero.agentVersion')}
                                        </div>
                                    </div>
                                </h1>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600 mt-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase tracking-wide text-xs">
                                            {seasonInfo.season} {t('common.season')}
                                        </span>
                                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-gray-400" />
                                        <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>{t('planner.activeSowing')}: <strong>{seasonInfo.sowingCount}</strong></span>
                                        <span>{t('planner.expectedHarvest')}: <strong>{seasonInfo.harvestCount}</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder={t('planner.searchPlaceholder')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm w-64"
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-3 w-full md:w-auto mt-4 md:mt-0">
                        {/* View Switcher */}
                        <div className="flex flex-1 md:flex-none items-center justify-center bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
                            <button onClick={() => setViewMode('calendar')} className={clsx("flex-1 md:flex-none p-2 md:px-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-bold", viewMode === 'calendar' ? "bg-green-100 text-green-700 shadow-sm" : "text-gray-500 hover:bg-gray-50")}>
                                <CalendarIcon className="w-4 h-4" /> <span className="md:inline">{t('planner.viewCalendar')}</span>
                            </button>
                            <button onClick={() => setViewMode('list')} className={clsx("flex-1 md:flex-none p-2 md:px-3 rounded-lg transition-all flex items-center justify-center gap-2 text-sm font-bold", viewMode === 'list' ? "bg-green-100 text-green-700 shadow-sm" : "text-gray-500 hover:bg-gray-50")}>
                                <List className="w-4 h-4" /> <span className="md:inline">{t('planner.viewList')}</span>
                            </button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button className="flex-1 md:flex-none bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md whitespace-nowrap" onClick={() => setIsTaskModalOpen(true)}>
                                <Plus className="w-5 h-5" />
                                <span className="md:inline">{t('planner.addTask')}</span>
                            </button>

                            <button
                                onClick={() => setShowAIPanel(!showAIPanel)}
                                className={clsx(
                                    "p-2.5 rounded-xl transition-all border flex items-center justify-center gap-2 shadow-sm",
                                    showAIPanel ? "bg-green-50 text-green-700 border-green-200" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                                )}
                                title={showAIPanel ? t('planner.toggleAI') : t('planner.toggleAI')}
                            >
                                {showAIPanel ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                                <span className="hidden lg:inline font-medium text-sm">{t('planner.aiInsights')}</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="relative z-10 flex flex-1 overflow-hidden">
                    {/* Left Sidebar: Plot & Crop Selector */}
                    {showLeftPanel && (
                        <aside className="w-72 bg-gradient-to-b from-white/60 to-slate-50/60 backdrop-blur-xl border-r border-white/40 p-4 hidden lg:block overflow-y-auto shadow-[inset_-10px_0_20px_-10px_rgba(0,0,0,0.02)]">
                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex justify-between items-center">
                                    {t('planner.selectField')}
                                    <span title={t('planner.filterFieldTooltip')}><HelpCircle className="w-3 h-3 text-gray-400 cursor-pointer" /></span>
                                </h3>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => setSelectedPlot('all')}
                                        className={clsx("w-full text-left p-3 rounded-xl transition-all border", selectedPlot === 'all' ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm" : "bg-white/40 border-transparent hover:bg-white hover:shadow-sm")}
                                    >
                                        <span className="font-semibold text-gray-800 block">{t('planner.allFields')}</span>
                                        <span className="text-xs text-gray-500">{t('planner.overviewMode')}</span>
                                    </button>
                                    {uniquePlots.map(plot => (
                                        <button
                                            key={plot.id}
                                            onClick={() => setSelectedPlot(plot.id)}
                                            className={clsx("w-full text-left p-2.5 rounded-xl transition-all border group relative", selectedPlot === plot.id ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200 shadow-sm" : "bg-white/40 border-transparent hover:bg-white hover:shadow-sm")}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="text-2xl">{plot.image}</div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-semibold text-gray-800 text-sm">{plot.name}</span>
                                                        {selectedPlot === plot.id && <CheckCircle className="w-3 h-3 text-indigo-600" />}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{plot.crop} • {plot.size}</div>
                                                </div>
                                            </div>

                                            {/* Tooltip for stats */}
                                            <div className="absolute left-full top-0 ml-2 w-40 bg-gray-800 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl transition-opacity">
                                                <div className="font-bold mb-1">Field Details</div>
                                                <div>Soil: {plot.soil}</div>
                                                <div>Irrigation: {plot.irrigation}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{t('planner.quickFilters')}</h3>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-white/50 p-2 rounded-lg transition">
                                        <input type="checkbox" checked={aiFilterOnly} onChange={e => setAiFilterOnly(e.target.checked)} className="rounded text-green-600 focus:ring-green-500" />
                                        {t('planner.aiFilterLabel')}
                                    </label>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="p-4 bg-white/40 rounded-xl border border-white/50 mb-6">
                                <h4 className="text-xs font-bold text-gray-500 mb-2">{t('planner.legend')}</h4>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center gap-2"><CheckCircle className="w-3 h-3 text-green-600" /> {t('status.done')}</div>
                                    <div className="flex items-center gap-2"><ClockIcon className="w-3 h-3 text-yellow-600" /> {t('status.pending')}</div>
                                    <div className="flex items-center gap-2"><AlertTriangle className="w-3 h-3 text-red-600" /> {t('dashboard.riskAlerts')}</div>
                                </div>
                            </div>

                            {/* Agent Status Widget */}
                            <div className="p-4 bg-gray-900 rounded-[24px] border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 blur-[30px]" />
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">{t('planner.agent.coreStatus')}</span>
                                    </div>
                                    <div className="text-[10px] text-white/50 font-mono space-y-1">
                                        <div className="flex justify-between"><span>{t('planner.agent.connectivity')}</span> <span className="text-emerald-400">{t('planner.agent.status.stable')}</span></div>
                                        <div className="flex justify-between"><span>{t('planner.agent.model')}</span> <span className="text-white">v2.1-Agri</span></div>
                                        <div className="flex justify-between"><span>{t('planner.agent.sync')}</span> <span className="text-blue-400">{t('planner.agent.status.live')}</span></div>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <p className="text-[9px] text-emerald-400/80 italic font-mono leading-tight">
                                            {agentLog}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    )}

                    {/* Main Workspace */}
                    <main className="flex-1 p-4 md:p-6 overflow-y-auto w-full space-y-6">
                        {/* Sarthi's Monthly Strategy Bar */}
                        <div className="max-w-6xl mx-auto">
                            <motion.div
                                key={format(currentMonth, 'MMMM')}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gray-900 rounded-[32px] p-1 shadow-2xl overflow-hidden group border border-white/5"
                            >
                                <div className="flex flex-col md:flex-row items-stretch md:items-center bg-white/5 backdrop-blur-3xl rounded-[31px] p-2 gap-4">
                                    <div className="bg-emerald-500 h-full w-2 md:w-3 rounded-full hidden md:block" />
                                    <div className="p-4 flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/30">
                                                {t('planner.activeDirective')}
                                            </div>
                                            <span className="text-xs text-white/40 font-mono">ID: AUTON-2026-{format(currentMonth, 'MMM').toUpperCase()}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 leading-none">
                                            {t('planner.objectivePrefix')} <span className="text-emerald-400 font-serif italic text-xl">{strategy.objective}</span>
                                        </h3>
                                        <p className="text-sm text-white/60 mt-2 leading-relaxed max-w-2xl font-medium">
                                            "{t('planner.descPrefix')} {format(currentMonth, 'MMMM')} 2026, {t('planner.descSuffix')} <span className="text-white">{strategy.desc}</span>"
                                        </p>
                                    </div>
                                    <div className="flex md:flex-col gap-2 p-4 border-t md:border-t-0 md:border-l border-white/10 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
                                                <span className="text-emerald-400 font-black text-xs leading-none">{strategy.completion}%</span>
                                                <span className="text-[8px] text-white/30 uppercase mt-1">{t('planner.auton')}</span>
                                            </div>
                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex flex-col items-center justify-center border border-white/10">
                                                <span className="text-blue-400 font-black text-xs leading-none">12</span>
                                                <span className="text-[8px] text-white/30 uppercase mt-1">{t('planner.directs')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div className="max-w-6xl mx-auto h-full flex flex-col">
                            {viewMode === 'calendar' ? (
                                <CalendarComponent
                                    tasks={filteredTasks}
                                    month={currentMonth}
                                    onNavigate={setCurrentMonth}
                                    onTaskClick={(t) => alert(`Task: ${t.title}`)}
                                    cropData={cropDetails}
                                    plots={plots}
                                />
                            ) : (
                                <ListViewComponent
                                    tasks={sortedTasks}
                                    onSort={handleSort}
                                    sortConfig={sortConfig}
                                    plots={plots}
                                />
                            )}
                        </div>
                    </main>

                    {/* Right Panel: AI & Insights (Collapsible) */}
                    <AnimatePresence mode='wait'>
                        {showAIPanel && (
                            <aside className="w-80 bg-white/40 backdrop-blur-xl border-l border-white/60 p-4 hidden xl:flex flex-col gap-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">

                                {/* AI Panel - "Command Center" Look */}
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-indigo-100 overflow-hidden shadow-xl shadow-indigo-900/5 ring-1 ring-indigo-900/5">
                                    <button onClick={() => togglePanel('ai')} className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm">
                                        <h2 className="text-sm font-bold flex items-center gap-2 text-white">
                                            <BrainCircuit className="w-4 h-4 text-indigo-200" />
                                            {t('planner.aiInsights')}
                                        </h2>
                                        {openPanels.ai ? <ChevronUp className="w-4 h-4 text-indigo-200" /> : <ChevronDown className="w-4 h-4 text-indigo-200" />}
                                    </button>

                                    <AnimatePresence>
                                        {openPanels.ai && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                <div className="p-4 space-y-4">
                                                    <div className="flex justify-between items-center text-xs px-1">
                                                        <span className="text-indigo-900 font-bold flex items-center gap-1"><Activity className="w-3 h-3" /> {t('planner.ai.liveAnalysis')}</span>
                                                        <button className="text-white bg-indigo-600 px-2 py-0.5 rounded text-[10px] shadow-sm hover:bg-indigo-700 transition">{t('planner.ai.acceptAll')}</button>
                                                    </div>
                                                    {AI_SUGGESTIONS.map(s => (
                                                        <AISuggestionCard key={s.id} suggestion={s} />
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Risk Panel */}
                                <div className="bg-white/60 rounded-2xl border border-red-100 overflow-hidden shadow-sm">
                                    <button onClick={() => togglePanel('risk')} className="w-full flex items-center justify-between p-4 bg-red-100/50 hover:bg-red-100 transition border-b border-red-100">
                                        <h2 className="text-sm font-bold text-red-900 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-600" />
                                            {t('dashboard.riskAlerts')}
                                        </h2>
                                        {openPanels.risk ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
                                    </button>

                                    <AnimatePresence>
                                        {openPanels.risk && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                <div className="p-4">
                                                    <div className="bg-red-50 rounded-xl p-3 border border-red-100 mb-2">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <div className="font-bold text-red-800 text-xs">{t('planner.risk.humidity.title')}</div>
                                                            <span className="bg-red-200 text-red-800 text-[10px] px-1.5 rounded font-bold">{t('planner.risk.high')}</span>
                                                        </div>
                                                        <p className="text-xs text-red-700 leading-tight mb-2 font-medium">{t('planner.risk.humidity.desc')}</p>
                                                        <button className="w-full bg-white border border-red-200 text-red-700 text-xs font-bold py-2 rounded-lg hover:bg-red-50 transition shadow-sm flex items-center justify-center gap-1">
                                                            <Plus className="w-3 h-3" /> {t('planner.risk.addAction')}
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Budget Panel */}
                                <div className="bg-white/60 rounded-2xl border border-gray-200 overflow-hidden shadow-sm mt-auto">
                                    <button onClick={() => togglePanel('budget')} className="w-full flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50 transition">
                                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-green-600" />
                                            {t('dashboard.inputBudget')}
                                        </h2>
                                        {openPanels.budget ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </button>

                                    <AnimatePresence>
                                        {openPanels.budget && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                <div className="p-4 space-y-2">
                                                    <BudgetRow label={t('planner.budget.seeds')} cost="₹1,800" />
                                                    <BudgetRow label={t('planner.budget.fertilizer')} cost="₹2,400" savings={`₹350 ${t('planner.budget.saved')}`} />
                                                    <BudgetRow label={t('planner.budget.labor')} cost="₹5,000" />
                                                    <div className="pt-2 border-t border-gray-200 mt-2 flex justify-between items-center font-bold text-gray-800 text-sm">
                                                        <span>{t('planner.budget.total')}</span>
                                                        <span>₹9,200</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </aside>
                        )}
                    </AnimatePresence>
                </div>

                {/* Task Modal */}
                {
                    isTaskModalOpen && (
                        <AddTaskModal onClose={() => setIsTaskModalOpen(false)} cropData={cropDetails} plots={uniquePlots} />
                    )
                }

                {/* Footer Bar */}
                <footer className={clsx(
                    "fixed bottom-0 right-0 z-30 bg-white border-t border-gray-200 p-3 md:p-4 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-all duration-300",
                    showLeftPanel ? "lg:left-72 left-0" : "left-0"
                )}>
                    <div className="hidden md:flex items-center gap-6 text-sm">
                        <div>
                            <span className="text-gray-500">{t('planner.tasks')}:</span> <span className="font-bold text-gray-800">{filteredTasks.length}</span>
                        </div>
                        <div>
                            <span className="text-gray-500">{t('planner.cost')}:</span> <span className="font-bold text-gray-800">₹12,450</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 ml-auto">
                        <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition" title="Export Plan">
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('planner.export')}</span>
                        </button>
                    </div>
                </footer>
            </div >
        </DashboardLayout >
    );
}

// --- Component: Calendar ---

function CalendarComponent({ tasks, month, onNavigate, onTaskClick, cropData, plots }: { tasks: Task[], month: Date, onNavigate: (d: Date) => void, onTaskClick: (t: Task) => void, cropData: any[], plots: Plot[] }) {
    const { t } = useTranslation();
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getTasksForDay = (date: Date) => tasks.filter(t => isSameDay(t.date, date));
    const hasRisk = (date: Date) => getTasksForDay(date).some(t => t.status === 'risk');

    const getTaskIcon = (type: string) => {
        switch (type) {
            case 'sowing': return <Sprout className="w-3 h-3 text-green-600" />;
            case 'irrigation': return <Droplets className="w-3 h-3 text-blue-500" />;
            case 'fertilization': return <Leaf className="w-3 h-3 text-emerald-500" />;
            case 'harvesting': return <Scissors className="w-3 h-3 text-amber-600" />;
            case 'scouting': return <Search className="w-3 h-3 text-purple-500" />;
            case 'protection': return <AlertTriangle className="w-3 h-3 text-red-500" />;
            default: return <CheckCircle className="w-3 h-3 text-gray-400" />;
        }
    };

    const currentMonthStr = format(month, 'MMMM');

    // Helper: Dynamic Season Info (Localized to Calendar)
    const seasonInfo = React.useMemo(() => {
        const sowingCrops = cropData.filter(c => c.sowingMonths.includes(currentMonthStr));
        const harvestingCrops = cropData.filter(c => c.harvestMonths.includes(currentMonthStr));

        let season = "Off-Season";
        const allActive = [...sowingCrops, ...harvestingCrops];
        if (allActive.length > 0) {
            const counts = allActive.reduce((acc, curr) => {
                acc[curr.season] = (acc[curr.season] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            season = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
        }
        return { season, sowingCount: sowingCrops.length, harvestCount: harvestingCrops.length };
    }, [currentMonthStr]);

    return (
        <div className="bg-gradient-to-br from-indigo-50/80 via-white/80 to-emerald-50/80 backdrop-blur-3xl rounded-3xl p-4 md:p-6 shadow-2xl shadow-slate-300/40 border border-white/60 h-full flex flex-col ring-1 ring-white/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-300/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-300/10 blur-[100px] rounded-full pointer-events-none" />
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3 relative z-10">
                        {format(month, 'MMMM yyyy')}
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 border border-emerald-200/60 px-2.5 py-0.5 rounded-full uppercase tracking-wide shadow-sm">
                            {seasonInfo.season}
                        </span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1 flex gap-3">
                        <span>{t('planner.activeSowing')}: <strong className="text-gray-700">{seasonInfo.sowingCount}</strong></span>
                        <span>{t('planner.expectedHarvest')}: <strong className="text-gray-700">{seasonInfo.harvestCount}</strong></span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onNavigate(subMonths(month, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Previous Month"><ChevronLeft className="w-5 h-5 text-gray-600" /></button>
                    <button onClick={() => onNavigate(addMonths(month, 1))} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Next Month"><ChevronRight className="w-5 h-5 text-gray-600" /></button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-2 flex-1">
                {weekDays.map(d => (
                    <div key={d} className="text-center text-xs font-bold text-gray-400 py-2 uppercase tracking-wider">{d}</div>
                ))}

                {Array.from({ length: start.getDay() }).map((_, i) => <div key={`empty-${i}`} className="min-h-[80px] md:min-h-[120px]" />)}

                {days.map(day => {
                    const dayTasks = getTasksForDay(day);
                    const isTodayDate = isToday(day);
                    const risk = hasRisk(day);

                    return (
                        <div
                            key={day.toString()}
                            className={clsx(
                                "min-h-[80px] md:min-h-[120px] border rounded-xl p-2 transition-all group relative flex flex-col gap-1 backdrop-blur-sm",
                                isTodayDate ? "bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 border-indigo-200 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-500/10 z-10" : "bg-white/40 border-white/50 hover:bg-white/80 hover:border-emerald-200/80 hover:shadow-lg hover:shadow-emerald-900/5 hover:-translate-y-0.5 hover:z-10"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <span className={clsx("text-sm font-bold block", isTodayDate ? "text-indigo-600" : "text-gray-500")}>
                                    {format(day, 'd')}
                                </span>
                                {risk && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title={t('dashboard.riskAlerts')} />}
                            </div>

                            <div className="space-y-1 flex-1 overflow-y-auto scrollbar-none">
                                {dayTasks.map(task => (
                                    <div key={task.id} onClick={(e) => { e.stopPropagation(); onTaskClick(task); }} className={clsx(
                                        "mb-1.5 p-2 rounded-lg border transition-all cursor-pointer shadow-sm hover:shadow-md group/task flex flex-col gap-1.5 relative overflow-hidden",
                                        task.status === 'done' ? "bg-emerald-50/90 border-emerald-200/60" :
                                            task.status === 'risk' ? "bg-red-50/90 border-red-200/60" :
                                                task.status === 'pending' ? "bg-amber-50/90 border-amber-200/60" :
                                                    "bg-white/80 border-slate-200/60 hover:border-indigo-300"
                                    )}>
                                        {/* Status Strip */}
                                        <div className={clsx("absolute left-0 top-0 bottom-0 w-1",
                                            task.status === 'done' ? "bg-green-500" :
                                                task.status === 'risk' ? "bg-red-500" :
                                                    task.status === 'pending' ? "bg-amber-400" :
                                                        "bg-blue-400"
                                        )} />

                                        <div className="pl-2 flex justify-between items-start gap-2">
                                            <div className="flex items-start gap-1.5 min-w-0">
                                                <div className="mt-0.5 shrink-0">{getTaskIcon(task.type)}</div>
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    {task.isAISuggestion && (
                                                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter animate-pulse shadow-sm">
                                                            <BrainCircuit className="w-2 h-2" />
                                                            {t('planner.ai.agentLed')}
                                                        </div>
                                                    )}
                                                    {task.status === 'risk' && (
                                                        <div className="px-1.5 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter flex items-center gap-1">
                                                            <Activity className="w-2 h-2" />
                                                            {t('planner.priority')}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="text-xs font-bold text-gray-800 leading-tight group-hover/task:text-emerald-700 transition-colors break-words">
                                                    {task.title}
                                                </span>
                                            </div>
                                            {task.severity === 'high' && <AlertTriangle className="w-3 h-3 text-red-500 shrink-0 animate-pulse mt-0.5" />}
                                        </div>

                                        <div className="pl-2 flex flex-col gap-1 mt-1 text-[10px] text-gray-500 font-medium">
                                            <span className="text-gray-600 break-words leading-tight">
                                                {plots.find(p => p.id === task.plotId)?.name || t('planner.unknown')}
                                            </span>
                                            <span className="font-mono text-gray-700 bg-black/5 px-1.5 py-0.5 rounded w-fit">₹{task.cost}</span>
                                        </div>

                                        {task.alert && (
                                            <div className="pl-2 mt-1 text-[9px] font-bold text-red-600 flex items-start gap-1 bg-red-100/50 p-1.5 rounded">
                                                <AlertTriangle className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                                                <span className="break-words leading-tight">{task.alert}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Hover Add Button */}
                            <button className="absolute bottom-2 right-2 p-1 bg-green-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                <Plus className="w-3 h-3" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// --- Component: List View ---

function ListViewComponent({ tasks, onSort, sortConfig, plots }: { tasks: Task[], onSort: (k: string) => void, sortConfig: any, plots: Plot[] }) {
    const { t } = useTranslation();
    const SortIcon = ({ colKey }: { colKey: string }) => {
        if (sortConfig?.key !== colKey) return <div className="w-3 h-3" />; // spacer
        return sortConfig.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />;
    }

    return (
        <div className="bg-white/60 backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl shadow-indigo-900/5 border border-white/60 mb-20 ring-1 ring-white/50 relative">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-indigo-100/50">
                        <tr>
                            {[
                                { label: t('planner.list.date'), key: 'date' },
                                { label: t('planner.list.taskDetails'), key: 'title' },
                                { label: t('planner.list.fieldCrop'), key: 'plotId' },
                                { label: t('planner.list.estCost'), key: 'cost' },
                                { label: t('planner.list.status'), key: 'status' }
                            ].map(col => (
                                <th key={col.key} onClick={() => onSort(col.key)} className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition">
                                    <div className="flex items-center gap-2">
                                        {col.label}
                                        <SortIcon colKey={col.key} />
                                    </div>
                                </th>
                            ))}
                            <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">{t('planner.list.action')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {tasks.map(task => (
                            <tr key={task.id} className="hover:bg-indigo-50/40 transition-colors group border-b border-dashed border-gray-100 last:border-0">
                                <td className="py-4 px-6 font-medium text-gray-700 text-sm whitespace-nowrap">
                                    {format(task.date, 'MMM dd, yyyy')}
                                </td>
                                <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <span className="p-2 bg-slate-100 rounded-xl text-slate-500 shadow-sm border border-slate-200/50">{getTaskIcon(task.type)}</span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="font-bold text-slate-900 block text-sm truncate">{task.title}</span>
                                                {task.isAISuggestion && (
                                                    <span className="flex items-center gap-1 px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-tighter shadow-sm">
                                                        <BrainCircuit className="w-3 h-3" />
                                                        {t('planner.ai.sarthiLogic')}
                                                    </span>
                                                )}
                                            </div>
                                            {task.alert && <span className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-lg font-bold border border-red-100/50 inline-flex items-center gap-1.5 shadow-sm"><AlertTriangle className="w-3 h-3" /> {task.alert}</span>}
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">
                                    {plots.find(p => p.id === task.plotId)?.name || t('planner.unknownPlot')}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600 font-mono">
                                    ₹{task.cost}
                                </td>
                                <td className="py-4 px-6">
                                    <StatusBadge status={task.status} />
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    )
}

// --- Component: AI Suggestion Card ---

function AISuggestionCard({ suggestion }: { suggestion: AISuggestion }) {
    const { t } = useTranslation();
    const [showReason, setShowReason] = useState(false);
    return (
        <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-sm relative group hover:shadow-lg hover:border-indigo-300 transition-all">
            <div className="absolute top-2 right-4 text-[10px] font-black text-indigo-200 uppercase tracking-widest group-hover:text-indigo-400">{t('planner.ai.sarthiLogic')}</div>
            <h4 className="text-sm font-bold text-gray-800 mb-1 capitalize flex items-center gap-2">
                {suggestion.type === 'reschedule' && <CalendarIcon className="w-3.5 h-3.5 text-orange-500" />}
                {suggestion.type === 'optimization' && <DollarSign className="w-3.5 h-3.5 text-emerald-500" />}
                {suggestion.type === 'intercropping' && <Leaf className="w-3.5 h-3.5 text-indigo-500" />}
                <span className="capitalize text-slate-900 tracking-tight underline decoration-indigo-200 decoration-2 underline-offset-4">{suggestion.type} Directive</span>
            </h4>
            <div className="absolute top-0 right-0 p-2">
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
            </div>
            <p className="text-xs text-slate-600 leading-relaxed my-3 font-semibold">
                {suggestion.text}
            </p>
            {suggestion.impact && (
                <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full w-fit mb-3 border border-emerald-100 uppercase tracking-tighter">
                    {t('planner.ai.impact')}: {suggestion.impact}
                </div>
            )}

            <button
                onClick={() => setShowReason(!showReason)}
                className="text-[10px] text-indigo-400 font-bold hover:text-indigo-600 mb-3 flex items-center gap-1 transition-colors"
            >
                {t('planner.ai.viewLogic')} {showReason ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <AnimatePresence>
                {showReason && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-[10px] text-indigo-900 bg-indigo-50/50 p-2.5 rounded-xl mb-3 leading-relaxed font-medium border border-indigo-100/50">
                        <span className="text-[9px] uppercase font-bold text-indigo-400 block mb-1">{t('planner.ai.reasoningPath')}</span>
                        {suggestion.reasoning}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex gap-2 mt-4">
                <button className="flex-1 text-[10px] font-black bg-indigo-600 text-white px-3 py-2 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-600/20 active:scale-95">
                    {t('planner.ai.endorse')}
                </button>
                <button className="px-3 py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition uppercase tracking-tighter">
                    {t('planner.ai.dismiss')}
                </button>
            </div>
        </div>
    )
}

// --- Component: Add Task Modal ---

// ... (existing code)

// --- Component: Add Task Modal ---

function AddTaskModal({ onClose, cropData, plots }: { onClose: () => void, cropData: any[], plots: Plot[] }) {
    const { t } = useTranslation();
    const steps = t('planner.modal.steps', { returnObjects: true });
    // Safe cast or fallback
    const stepLabels = Array.isArray(steps) ? steps : ['Select Field', 'Select Crop', 'Task Details'];

    const [step, setStep] = useState(0);
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [taskType, setTaskType] = useState<string>(''); // e.g., 'Sowing', 'Harvesting', 'Others'
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Derived logic for hints & validation
    const selectedCropData = cropData.find(c => c.crop === selectedCrop);

    // Strict Validation Logic
    const getValidationStatus = () => {
        if (!selectedDate || !cropData || !taskType) return { isValid: true, message: '' };

        const dateObj = new Date(selectedDate);
        if (isNaN(dateObj.getTime())) return { isValid: true, message: '' };

        const selectedMonth = format(dateObj, 'MMMM'); // e.g., "January"

        if (taskType === 'Sowing') {
            if (!selectedCropData.sowingMonths.includes(selectedMonth)) {
                return {
                    isValid: false,
                    message: `${t('planner.modal.error.sowingDate')} ${selectedCrop} ${t('planner.modal.error.sowingRange')}: ${selectedCropData.sowingMonths.join(', ')}`
                };
            }
        }
        if (taskType === 'Harvesting') {
            if (!selectedCropData.harvestMonths.includes(selectedMonth)) {
                return {
                    isValid: false,
                    message: `${t('planner.modal.error.harvestDate')} ${selectedCrop} ${t('planner.modal.error.harvestRange')}: ${selectedCropData.harvestMonths.join(', ')}`
                };
            }
        }
        return { isValid: true, message: '' };
    };

    const validation = getValidationStatus();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800">{t('planner.modal.addTaskTitle')}</h3>
                    <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
                </div>

                <div className="p-6">
                    {/* Step Indicator */}
                    <div className="flex gap-2 mb-6">
                        {stepLabels.map((s: string, i: number) => (
                            <div key={i} className="flex-1">
                                <div className={clsx("h-1 rounded-full mb-2 transition-all", i <= step ? "bg-green-500" : "bg-gray-200")} />
                                <span className={clsx("text-[10px] font-bold uppercase tracking-wider block text-center", i <= step ? "text-green-600" : "text-gray-400")}>{s}</span>
                            </div>
                        ))}
                    </div>

                    <div className="min-h-[280px]">
                        {step === 0 && (
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t('planner.modal.selectFieldQuestion')}</h4>
                                <div className="grid grid-cols-1 gap-3">
                                    {plots.map(plot => (
                                        <button
                                            key={plot.id}
                                            onClick={() => setStep(1)}
                                            className="flex items-center gap-4 p-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition group text-left"
                                        >
                                            <div className="text-2xl">{plot.image}</div>
                                            <div>
                                                <div className="font-bold text-gray-800">{plot.name}</div>
                                                <div className="text-xs text-gray-500">{plot.crop}</div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 ml-auto group-hover:text-green-500" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {step === 1 && (
                            <div className="space-y-3">
                                <h4 className="text-sm font-medium text-gray-600 mb-2">{t('planner.modal.selectCrop')}</h4>
                                <div className="max-h-60 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {cropData.map(c => (
                                        <button
                                            key={c.crop}
                                            onClick={() => { setSelectedCrop(c.crop); setStep(2); }}
                                            className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-500 hover:bg-green-50 transition font-medium text-gray-700 flex justify-between"
                                        >
                                            <span>{c.crop}</span>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">{c.season}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('planner.modal.taskType')}</label>
                                    <select
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                                        onChange={(e) => setTaskType(e.target.value)}
                                    >
                                        <option value="">{t('planner.modal.selectTypePlaceholder')}</option>
                                        <option value="Sowing">Sowing</option>
                                        <option value="Harvesting">Harvesting</option>
                                        <option value="Irrigation">Irrigation</option>
                                        <option value="Fertilization">Fertilization</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                {taskType === 'Sowing' && selectedCropData && (
                                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded flex items-start gap-2">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <span>{t('planner.modal.recommendedSowing')}: <strong>{selectedCropData.sowingMonths.join(', ')}</strong></span>
                                    </div>
                                )}
                                {taskType === 'Harvesting' && selectedCropData && (
                                    <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded flex items-start gap-2">
                                        <Info className="w-4 h-4 shrink-0" />
                                        <span>{t('planner.modal.expectedHarvest')}: <strong>{selectedCropData.harvestMonths.join(', ')}</strong></span>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('planner.modal.taskName')}</label>
                                    <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder={taskType ? `${taskType} ${selectedCrop}` : t('planner.modal.taskNamePlaceholder')} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('planner.modal.date')}</label>
                                    <input
                                        type="date"
                                        className={clsx(
                                            "w-full p-2 border rounded-lg focus:ring-2 outline-none transition-colors",
                                            !validation.isValid ? "border-red-300 bg-red-50 focus:ring-red-500" : "border-gray-300 focus:ring-green-500"
                                        )}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                    {/* Strict Validation Error Message */}
                                    {!validation.isValid ? (
                                        <p className="text-xs text-red-600 mt-2 flex items-start gap-1 font-bold animate-pulse">
                                            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                                            {validation.message}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1"><Sprout className="w-3 h-3" /> {t('planner.modal.aiDateHint')}</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-between">
                    <button
                        onClick={() => setStep(Math.max(0, step - 1))}
                        disabled={step === 0}
                        className="px-4 py-2 text-gray-500 font-medium hover:bg-gray-100 rounded-lg disabled:opacity-50"
                    >
                        {t('planner.modal.back')}
                    </button>
                    {step < 2 ? (
                        <button className="px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-lg cursor-not-allowed">{t('planner.modal.next')}</button>
                    ) : (
                        <button
                            onClick={onClose}
                            disabled={!validation.isValid}
                            className={clsx(
                                "px-6 py-2 font-bold rounded-lg shadow-lg transition-all",
                                !validation.isValid
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-600 text-white hover:bg-green-700 shadow-green-500/20"
                            )}
                        >
                            {t('planner.modal.createTask')}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

// --- Helper Components & Functions ---

function BudgetRow({ label, cost, savings }: { label: string, cost: string, savings?: string }) {
    return (
        <div className="flex items-center justify-between text-xs py-1">
            <span className="text-gray-600 font-medium">{label}</span>
            <div className="text-right">
                <div className="text-gray-900 font-bold">{cost}</div>
                {savings && <div className="text-[10px] text-green-600">{savings}</div>}
            </div>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    const { t } = useTranslation();
    const config = {
        done: { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, label: t('status.completed') },
        pending: { color: 'bg-yellow-50 text-yellow-700 border-yellow-200', icon: Clock, label: t('status.pending') },
        upcoming: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: CalendarIcon, label: t('status.upcoming') },
        risk: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: t('dashboard.riskAlerts') }
    }[status] || { color: 'bg-gray-100', icon: Info, label: status };

    const Icon = config.icon;

    return (
        <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-full border w-fit", config.color)}>
            <Icon className="w-3 h-3" />
            <span className="text-xs font-bold">{config.label}</span>
        </div>
    )
}

function getTaskIcon(type: string) {
    switch (type) {
        case 'sowing': return <Sprout className="w-3 h-3 text-green-600" />;
        case 'irrigation': return <Droplets className="w-3 h-3 text-blue-500" />;
        case 'fertilization': return <Leaf className="w-3 h-3 text-emerald-500" />; // approximating
        case 'harvesting': return <Scissors className="w-3 h-3 text-amber-600" />;
        case 'protection': return <AlertTriangle className="w-3 h-3 text-red-500" />;
        default: return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
}



function Clock(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
    )
}
