
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Sprout, Calendar, AlertTriangle, Wallet,
    Droplets, Sun, ChevronRight,
    CheckCircle, ArrowRight, Activity,
    TrendingUp, BarChart3,
    Bot, Sparkles, Mic,
    AlertOctagon, FileText
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

// --- COMPONENTS ---

function KPICard({ label, value, sub, icon: Icon, color }: any) {
    const colors: any = {
        emerald: "bg-emerald-100/50 text-emerald-800 border-emerald-200/50",
        blue: "bg-blue-100/50 text-blue-800 border-blue-200/50",
        amber: "bg-amber-100/50 text-amber-800 border-amber-200/50",
        purple: "bg-purple-100/50 text-purple-800 border-purple-200/50",
    };

    return (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl p-4 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-4 group">
            <div className={clsx("p-3 rounded-xl border shadow-sm transition-colors", colors[color])}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-2xl font-black text-slate-800 leading-none">{value}</div>
                <div className="text-xs font-bold text-slate-500 mt-1">{label}</div>
                <div className="text-[10px] font-bold text-slate-400/80 mt-0.5 uppercase tracking-wider">{sub}</div>
            </div>
        </div>
    )
}

function StatusDot({ status }: { status: string }) {
    const colors: any = {
        healthy: 'bg-emerald-500 shadow-emerald-200 shadow-[0_0_8px]',
        warning: 'bg-amber-500 shadow-amber-200 shadow-[0_0_8px]',
        critical: 'bg-red-500 shadow-red-200 shadow-[0_0_8px]',
        ok: 'bg-emerald-500 shadow-emerald-200 shadow-[0_0_8px]',
        low: 'bg-red-500 shadow-red-200 shadow-[0_0_8px]'
    };
    return <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || 'bg-gray-300'}`} />
}

function TaskRow({ task }: any) {
    const { t } = useTranslation();
    return (
        <div className="flex items-center gap-3 p-3 bg-white/50 border border-slate-100 rounded-xl hover:bg-white hover:border-indigo-100 transition-all cursor-pointer group">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {task.typeIcon === 'Irrigate' && <Droplets size={18} />}
                {task.typeIcon === 'Fertilize' && <Sprout size={18} />}
                {task.typeIcon === 'Scouting' && <Activity size={18} />}
                {!['Irrigate', 'Fertilize', 'Scouting'].includes(task.typeIcon) && <Calendar size={18} />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex justify-between">
                    <h5 className="font-bold text-slate-800 text-sm truncate">{task.type} - {task.crop}</h5>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{task.date}</span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="truncate">{task.field}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className={clsx("capitalize", task.status === 'pending' ? 'text-amber-600 font-bold' : 'text-slate-500')}>
                        {task.status === 'pending' ? t('status.pending') : task.status === 'upcoming' ? t('status.upcoming') : task.status}
                    </span>
                </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
        </div>
    )
}

function UnifiedAlertsCard({ alerts }: any) {
    const { t } = useTranslation();
    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-indigo-100/50 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <AlertOctagon className="text-red-500 w-5 h-5" />
                    {t('dashboard.alerts.title')}
                </h3>
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                    {alerts.length + 1} {t('dashboard.alerts.actionsNeeded')}
                </span>
            </div>

            {/* AI Insight Section */}
            <div className="p-5 bg-gradient-to-br from-[#1e1b4b] to-[#3730a3] text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/30 rounded-xl border border-indigo-400/30 backdrop-blur-md hidden sm:block">
                            <Bot className="w-6 h-6 text-indigo-200" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={12} className="text-amber-300" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{t('dashboard.alerts.sarthiIntelligence')}</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight">
                                Heavy rain expected. Defer irrigation for <span className="text-indigo-200 underline decoration-indigo-400 cursor-pointer">Field A</span>.
                            </h4>
                            <p className="text-xs text-indigo-100/80 leading-relaxed max-w-lg">
                                70% rain probability tomorrow. Waiting 24h will save water and prevent root rot.
                            </p>
                            <div className="flex gap-3 pt-2">
                                <button className="px-4 py-1.5 bg-white text-indigo-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition active:scale-95 flex items-center gap-1.5">
                                    <CheckCircle size={12} /> {t('dashboard.alerts.accept')}
                                </button>
                                <button className="px-4 py-1.5 bg-indigo-800/50 text-indigo-200 text-xs font-bold rounded-lg border border-indigo-500/30 hover:bg-indigo-800/70 transition">
                                    {t('dashboard.alerts.ignore')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Other Alerts List */}
            <div className="p-4 space-y-3 flex-1 overflow-y-auto min-h-[150px]">
                {alerts.map((alert: any) => (
                    <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl bg-red-50/50 border border-red-100 hover:bg-red-50 transition-colors cursor-pointer group">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-bold uppercase text-red-700 tracking-wide">{alert.type}</span>
                                <ChevronRight size={14} className="text-red-300 group-hover:text-red-500" />
                            </div>
                            <div className="font-bold text-slate-800 text-sm mt-0.5">{alert.target}</div>
                            <div className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full" /> {alert.action}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function UnifiedPlannerCard({ tasks }: any) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');

    const filteredTasks = tasks.filter((task: any) => {
        if (activeTab === 'today') return task.timeline === 'today';
        return true;
    });

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100/50 flex items-center justify-between">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Calendar className="text-blue-600 w-5 h-5" />
                    {t('dashboard.planner.title')}
                </h3>
                <div className="flex bg-slate-100/50 p-1 rounded-lg">
                    {['today', 'week'].map((tab: any) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={clsx(
                                "px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all",
                                activeTab === tab ? "bg-white text-blue-700 shadow-sm" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {t(`dashboard.planner.${tab}`)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 space-y-2 flex-1 overflow-y-auto min-h-[300px]">
                {filteredTasks.map((task: any) => (
                    <TaskRow key={task.id} task={task} />
                ))}
                <div className="pt-2 text-center">
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 mx-auto">
                        {t('dashboard.planner.viewCalendar')} <ArrowRight size={12} />
                    </button>
                </div>
            </div>
        </div>
    )
}

function UnifiedStatusCard({ farmStatus }: any) {
    const { t } = useTranslation();
    const [tab, setTab] = useState<'crops' | 'stock' | 'season'>('crops');

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-emerald-100/50 flex flex-col h-full">
            <div className="px-6 py-4 border-b border-slate-100/50">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3">
                    <Activity className="text-emerald-600 w-5 h-5" />
                    {t('dashboard.farmStatus.title')}
                </h3>
                <div className="flex border-b border-slate-200/50">
                    {[
                        { id: 'crops', label: t('dashboard.farmStatus.crops') },
                        { id: 'stock', label: t('dashboard.farmStatus.stock') },
                        { id: 'season', label: t('dashboard.farmStatus.season') },
                    ].map((t: any) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={clsx(
                                "flex-1 pb-2 text-xs font-bold uppercase tracking-wider transition-all relative",
                                tab === t.id ? "text-emerald-600" : "text-slate-400 hover:text-slate-500"
                            )}
                        >
                            {t.label}
                            {tab === t.id && (
                                <motion.div layoutId="underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    {tab === 'crops' && (
                        <motion.div key="crops" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {farmStatus.health.map((h: any, i: any) => (
                                <div key={i} className="flex items-center justify-between group cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <StatusDot status={h.status} />
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition">{h.crop}</div>
                                            <div className="text-[10px] text-slate-400 font-bold uppercase">{h.field} • {h.area}</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    end</div>
                            ))}
                        </motion.div>
                    )}

                    {tab === 'stock' && (
                        <motion.div key="stock" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {farmStatus.stock.map((s: any, i: any) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-slate-700">
                                        <span>{s.name}</span>
                                        <span className={s.status === 'low' ? 'text-red-500' : 'text-slate-400'}>{s.level}% ({s.status})</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={clsx("h-full rounded-full", s.status === 'low' ? 'bg-red-500' : 'bg-blue-500')}
                                            style={{ width: `${s.level}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {tab === 'season' && (
                        <motion.div key="season" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-5 text-center pt-2">
                            <div className="inline-block p-4 rounded-full bg-orange-50 border border-orange-100 mb-2">
                                <Sun className="w-8 h-8 text-orange-500" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-800">{farmStatus.season.name}</h4>
                                <p className="text-sm text-slate-500 font-medium mt-1">{t('dashboard.farmStatus.expectedHarvest')}: {farmStatus.season.harvest}</p>
                            </div>
                            <div className="relative pt-4">
                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-400 w-[42%]" />
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mt-2">
                                    <span>{t('dashboard.farmStatus.sowing')}</span>
                                    <span>{t('dashboard.farmStatus.harvest')}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100/50 text-center">
                <button className="text-[10px] font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-600 transition">{t('dashboard.farmStatus.viewReport')}</button>
            </div>
        </div>
    )
}

function QuickActionsBar() {
    const { t } = useTranslation();
    const actions = [
        { label: t('dashboard.quickActions.logExpense'), icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' },
        { label: t('dashboard.quickActions.updateStock'), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: t('dashboard.quickActions.checkPrices'), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
        { label: t('dashboard.quickActions.askSarthi'), icon: Mic, color: 'text-indigo-600', bg: 'bg-indigo-100', agent: true }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action: any, i: any) => (
                <button key={i} className="flex items-center gap-3 p-4 bg-white/60 active:bg-white/80 active:scale-95 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all group text-left">
                    <div className={clsx("p-2.5 rounded-xl", action.agent ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-100 group-hover:border-indigo-200 group-hover:text-indigo-600")}>
                        <action.icon size={20} />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{action.label}</div>
                        {action.agent && <div className="text-[10px] font-bold text-indigo-600">{t('dashboard.quickActions.aiAssistant')}</div>}
                    </div>
                </button>
            ))}
        </div>
    )
}

function AdditionalResources({ schemes }: any) {
    return (
        <div className="bg-white/40 backdrop-blur-md rounded-3xl p-1 border border-white/30 flex flex-col md:flex-row gap-1">
            {schemes.map((s: any) => (
                <div key={s.id} className="flex-1 flex items-center gap-3 p-3 hover:bg-white/60 rounded-2xl transition cursor-pointer group">
                    <div className="p-2 bg-emerald-100/50 text-emerald-700 rounded-xl">
                        <s.icon size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-700">{s.title}</div>
                        <div className="text-[10px] font-bold text-emerald-600">{s.due}</div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default function DashboardPage() {
    const { t } = useTranslation();

    // --- MOCK DATA WITH TRANSLATIONS ---
    const KPI_DATA = [
        { label: t('dashboard.kpi.activeCrops'), value: '3 / 5', sub: t('dashboard.kpi.cropsFields'), icon: Sprout, color: 'emerald' },
        { label: t('dashboard.kpi.todayTasks'), value: '2 ' + t('dashboard.kpi.pending'), sub: '4 ' + t('dashboard.kpi.completed'), icon: Calendar, color: 'blue' },
        { label: t('dashboard.kpi.weatherRisk'), value: 'Moderate', sub: t('dashboard.kpi.heatAlert'), icon: AlertTriangle, color: 'amber' },
        { label: t('dashboard.kpi.budgetUsed'), value: '₹12,500', sub: t('dashboard.kpi.of') + ' ₹20,000', icon: Wallet, color: 'purple' },
    ];

    const FARM_STATUS = {
        season: { name: t('dashboard.farmStatus.rabiSeason'), progress: 42, harvest: 'April 2026' },
        health: [
            { field: 'Field A', crop: 'Wheat', status: 'healthy', area: '2.5 Acres' },
            { field: 'Field B', crop: 'Mustard', status: 'warning', area: '1.2 Acres' },
            { field: 'Field C', crop: 'Potato', status: 'critical', area: '0.8 Acres' },
        ],
        stock: [
            { name: 'Urea', level: 20, status: 'low', unit: 'Bags' },
            { name: 'DAP', level: 85, status: 'ok', unit: 'kg' },
            { name: 'Seeds', level: 60, status: 'ok', unit: 'pkts' },
        ]
    };

    const TASKS = [
        { id: 1, type: 'Irrigate', typeIcon: 'Irrigate', crop: 'Wheat', field: 'Field A', date: t('dashboard.planner.today') + ', 4:00 PM', status: 'pending', timeline: 'today' },
        { id: 2, type: 'Scouting', typeIcon: 'Scouting', crop: 'Mustard', field: 'Field B', date: t('dashboard.planner.today') + ', 5:30 PM', status: 'pending', timeline: 'today' },
        { id: 3, type: 'Fertilize', typeIcon: 'Fertilize', crop: 'Potato', field: 'Field C', date: 'Tomorrow', status: 'upcoming', timeline: 'week' },
        { id: 4, type: 'Spray', typeIcon: 'Spray', crop: 'Wheat', field: 'Field A', date: 'Jan 12', status: 'upcoming', timeline: 'week' },
        { id: 5, type: 'Harvest', typeIcon: 'Harvest', crop: 'Mustard', field: 'Field B', date: 'Jan 28', status: 'upcoming', timeline: 'month' },
    ];

    const ALERTS = [
        { id: 1, type: 'Heatwave', target: 'Wheat (Field A)', action: 'Irrigate this evening', level: 'high' },
        { id: 2, type: 'Pest Risk', target: 'Mustard (Field B)', action: 'Scout for Aphids', level: 'medium' },
    ];

    const SCHEMES = [
        { id: 1, title: 'PM-Kisan Installment', due: 'Credits in 5 days', icon: Wallet },
        { id: 2, title: 'Drip Irrigation Subsidy', due: 'Closing soon', icon: Droplets },
        { id: 3, title: 'Soil Health Card', due: 'Update Required', icon: FileText },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen pb-20 p-4 md:p-6 lg:p-8 font-sans text-slate-800 bg-gradient-to-br from-lime-200 via-green-300 to-emerald-400 relative">

                <div className="relative z-10 max-w-7xl mx-auto space-y-8">

                    {/* 1. Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                                {t('navigation.dashboard')}
                                <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> {t('dashboard.live')}
                                </span>
                            </h1>
                            <p className="text-slate-500 font-medium">{t('dashboard.welcome')}, Aravind</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-300 hover:bg-slate-700 transition active:scale-95 flex items-center gap-2">
                                <Bot size={18} /> Sarthi Assistant
                            </button>
                        </div>
                    </div>

                    {/* 2. KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {KPI_DATA.map((kpi, i) => (
                            <KPICard key={i} {...kpi} />
                        ))}
                    </div>

                    {/* 3. Main Control Panel Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

                        {/* LEFT COLUMN (Integrated Alerts & Risks + Planner) */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                            {/* ALERTS & INTELLIGENCE */}
                            <div className="md:col-span-2">
                                <UnifiedAlertsCard alerts={ALERTS} />
                            </div>

                            {/* PLANNER */}
                            <div className="md:col-span-2">
                                <UnifiedPlannerCard tasks={TASKS} />
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Farm Status) */}
                        <div className="lg:col-span-4 h-full">
                            <UnifiedStatusCard farmStatus={FARM_STATUS} />
                        </div>
                    </div>

                    {/* 4. Secondary Actions / Footer */}
                    <div className="space-y-4">
                        <QuickActionsBar />
                        <AdditionalResources schemes={SCHEMES} />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
