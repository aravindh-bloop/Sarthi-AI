
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Sprout, Calendar, AlertTriangle, Wallet,
    Droplets, Sun, ChevronRight,
    CheckCircle, ArrowRight, Activity,
    TrendingUp, TrendingDown, BarChart3,
    Bot, Sparkles,
    AlertOctagon, FileText, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
    const [showAiAlert, setShowAiAlert] = useState(true);
    const [ignoreWarning, setIgnoreWarning] = useState(false);

    return (
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 shadow-xl shadow-indigo-100/50 overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100/50 flex items-center justify-between bg-white/40">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <AlertOctagon className="text-red-500 w-5 h-5" />
                    {t('dashboard.alerts.title')}
                </h3>
                <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                    {alerts.length + (showAiAlert ? 1 : 0)} {t('dashboard.alerts.actionsNeeded')}
                </span>
            </div>

            {showAiAlert && (
                <div className="p-5 bg-gradient-to-br from-[#1e1b4b] to-[#3730a3] text-white relative overflow-hidden shrink-0 transition-all duration-500">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/30 blur-[60px] rounded-full pointer-events-none" />

                    <div className="relative z-10">
                        {!ignoreWarning ? (
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
                                        {t('alertsData.aiHeader')} <span className="text-indigo-200 underline decoration-indigo-400 cursor-pointer">{t('fields.fieldA')}</span>.
                                    </h4>
                                    <p className="text-xs text-indigo-100/80 leading-relaxed max-w-lg">
                                        {t('alertsData.aiBody')}
                                    </p>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => setShowAiAlert(false)}
                                            className="px-4 py-1.5 bg-white text-indigo-900 text-xs font-bold rounded-lg shadow-sm hover:bg-slate-50 transition active:scale-95 flex items-center gap-1.5"
                                        >
                                            <CheckCircle size={12} /> {t('dashboard.alerts.accept')}
                                        </button>
                                        <button
                                            onClick={() => setIgnoreWarning(true)}
                                            className="px-4 py-1.5 bg-indigo-800/50 text-indigo-200 text-xs font-bold rounded-lg border border-indigo-500/30 hover:bg-indigo-800/70 transition"
                                        >
                                            {t('dashboard.alerts.ignore')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center text-center space-y-4 py-2"
                            >
                                <AlertTriangle className="w-8 h-8 text-amber-400 animate-pulse" />
                                <div>
                                    <h4 className="font-bold text-white text-lg">Are you sure?</h4>
                                    <p className="text-xs text-indigo-200 max-w-xs mx-auto mt-1">
                                        Ignoring this alert may lead to <span className="text-amber-300 font-bold">15% yield loss</span> in Wheat due to moisture stress.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowAiAlert(false)}
                                        className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-red-500/20 transition active:scale-95"
                                    >
                                        Yes, Ignore Risk
                                    </button>
                                    <button
                                        onClick={() => setIgnoreWarning(false)}
                                        className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg border border-white/20 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

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
    const navigate = useNavigate();

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
                    <button
                        onClick={() => navigate('/planner')}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center justify-center gap-1 mx-auto"
                    >
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
                                </div>
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

function QuickActionsBar({ onLogExpense, onUpdateStock, onCheckPrices }: any) {
    const { t } = useTranslation();
    const actions = [
        { label: t('dashboard.quickActions.logExpense'), icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100', onClick: onLogExpense },
        { label: t('dashboard.quickActions.updateStock'), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-100', onClick: onUpdateStock },
        { label: t('dashboard.quickActions.checkPrices'), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100', onClick: onCheckPrices },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action: any, i: any) => (
                <button
                    key={i}
                    onClick={action.onClick}
                    className="flex items-center gap-3 p-4 bg-white/60 active:bg-white/80 active:scale-95 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all group text-left"
                >
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


function ExpenseModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Wallet className="text-purple-600" /> Log Expense
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Amount (₹)</label>
                        <input type="number" className="w-full mt-1 p-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="0.00" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                        <select className="w-full mt-1 p-2 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
                            <option>Fertilizers</option>
                            <option>Seeds</option>
                            <option>Labor</option>
                            <option>Machinery</option>
                        </select>
                    </div>
                    <button onClick={onClose} className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition">
                        Save Expense
                    </button>
                    <button onClick={onClose} className="w-full py-2 bg-transparent text-slate-500 font-bold text-xs hover:text-slate-700 transition">
                        Cancel
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

function MarketPricesModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    const items = [
        { crop: 'Wheat', price: '₹2,250/q', trend: 'up' },
        { crop: 'Mustard', price: '₹5,400/q', trend: 'up' },
        { crop: 'Potato', price: '₹1,100/q', trend: 'down' },
        { crop: 'Onion', price: '₹2,800/q', trend: 'stable' },
    ];
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm relative z-10">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-emerald-600" /> Market Prices
                </h3>
                <div className="space-y-3">
                    {items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <span className="font-bold text-slate-700">{item.crop}</span>
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold text-slate-900">{item.price}</span>
                                {item.trend === 'up' && <TrendingUp size={16} className="text-emerald-500" />}
                                {item.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
                                {item.trend === 'stable' && <div className="w-4 h-1 bg-slate-300 rounded-full" />}
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={onClose} className="w-full mt-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition">
                    Close
                </button>
            </motion.div>
        </div>
    );
}


export default function DashboardPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const { settings } = useSettings();
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);

    const [dashboardData, setDashboardData] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [weather, setWeather] = useState<any>(null);
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- MOCK DATA FOR FALLBACK ---
    const MOCK_DATA = {
        stats: {
            kpi: { activeCrops: 4, totalPlots: 6, todayTasks: 3, completedTasks: 1, budgetUsed: 14500 },
            alerts: [
                { id: 'a1', category: 'cropHealth', type: 'Pest Risk', target: 'Plot C (Chilli)', action: 'Monitor', level: 'medium' },
                { id: 'a2', category: 'weather', type: 'High Wind', target: 'Farm Wide', action: 'Secure setup', level: 'low' }
            ],
            farmStatus: {
                health: [
                    { field: 'Plot A - North', crop: 'Mustard', status: 'healthy', area: '2.5 Acres' },
                    { field: 'Plot B - East', crop: 'Potato', status: 'warning', area: '1.2 Acres' },
                    { field: 'Plot C - South', crop: 'Chilli', status: 'healthy', area: '0.8 Acres' },
                    { field: 'Greenhouse 1', crop: 'Peppers', status: 'ok', area: '0.5 Acres' }
                ],
                stock: [
                    { name: 'Urea Fertilizer', level: 15, status: 'low', unit: 'kg' },
                    { name: 'Diesel Fuel', level: 40, status: 'ok', unit: 'L' }
                ]
            }
        },
        tasks: [
            { id: 't1', plotId: 'p1', type: 'irrigation', title: 'Mustard Final Irrigation', date: new Date().toISOString(), status: 'pending', cost: 1200, isAISuggestion: false },
            { id: 't2', plotId: 'p2', type: 'harvesting', title: 'Potato Harvest Cycle', date: new Date().toISOString(), status: 'done', cost: 4500, isAISuggestion: true },
            { id: 't3', plotId: 'p3', type: 'protection', title: 'Frost Shield Monitoring', date: new Date(Date.now() + 86400000).toISOString(), status: 'upcoming', cost: 0, isAISuggestion: true },
        ],
        weather: {
            current: { temp: 24, humidity: 55, condition: "Sunny", windSpeed: 12 },
            forecast: [
                { day: "Mon", temp: 25, condition: "Sunny" },
                { day: "Tue", temp: 27, condition: "Cloudy" }
            ],
            alerts: [{ id: 'w1', type: 'heatwave', severity: 'medium', message: 'Temp rising >35°C', suggestedAction: 'Schedule irrigation' }]
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Reset error on reload
                setError(null);

                const [statsRes, tasksRes, weatherRes] = await Promise.all([
                    fetch('/api/dashboard-stats'),
                    fetch('/api/tasks?limit=10'),
                    fetch('/api/weather')
                ]);

                if (statsRes.ok && tasksRes.ok && weatherRes.ok) {
                    const stats = await statsRes.json();
                    setDashboardData(stats);

                    const t = await tasksRes.json();
                    const formattedTasks = t.map((task: any) => ({
                        ...task,
                        timeline: new Date(task.date).toDateString() === new Date().toDateString() ? 'today' : 'week',
                        typeIcon: task.type.charAt(0).toUpperCase() + task.type.slice(1)
                    }));
                    setTasks(formattedTasks);

                    const w = await weatherRes.json();
                    setWeather(w);
                } else {
                    // Force Error to trigger Mock Data
                    throw new Error("Backend unavailable");
                }
            } catch (error) {
                console.warn("Backend API unavailable. Switching to Demo Mode (Mock Data).");
                setDashboardData(MOCK_DATA.stats);

                const formattedMockTasks = MOCK_DATA.tasks.map((task: any) => ({
                    ...task,
                    timeline: new Date(task.date).toDateString() === new Date().toDateString() ? 'today' : 'week',
                    typeIcon: task.type.charAt(0).toUpperCase() + task.type.slice(1)
                }));
                setTasks(formattedMockTasks);

                setWeather(MOCK_DATA.weather);
            } finally {
                setDataLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- DERIVED DATA ---
    const KPI_DATA = dashboardData ? [
        { label: t('dashboard.kpi.activeCrops'), value: `${dashboardData.kpi.activeCrops} / ${dashboardData.kpi.totalPlots}`, sub: t('dashboard.kpi.cropsFields'), icon: Sprout, color: 'emerald' },
        { label: t('dashboard.kpi.todayTasks'), value: `${dashboardData.kpi.todayTasks} ${t('dashboard.kpi.pending')}`, sub: `${dashboardData.kpi.completedTasks} ${t('dashboard.kpi.completed')}`, icon: Calendar, color: 'blue' },
        { label: t('dashboard.kpi.weatherRisk'), value: weather?.alerts?.[0]?.severity || 'Low', sub: weather?.current?.condition || t('dashboard.kpi.heatAlert'), icon: AlertTriangle, color: 'amber' },
        { label: t('dashboard.kpi.budgetUsed'), value: `₹${dashboardData.kpi.budgetUsed}`, sub: t('dashboard.kpi.of') + ' ₹50,000', icon: Wallet, color: 'purple' },
    ] : [];

    const FARM_STATUS = dashboardData ? {
        season: { name: t('dashboard.farmStatus.rabiSeason'), progress: 42, harvest: 'April 2026' },
        health: dashboardData.farmStatus.health,
        stock: dashboardData.farmStatus.stock
    } : { season: { name: '', progress: 0, harvest: '' }, health: [], stock: [] };

    const ALL_ALERTS = dashboardData ? [
        ...(weather?.alerts?.map((a: any) => ({ ...a, category: 'weather', target: 'Farm Wide', action: a.suggestedAction, level: a.severity })) || []),
        ...dashboardData.alerts
    ] : [];

    const activeAlerts = ALL_ALERTS.filter((alert: any) => {
        if (alert.category === 'weather' && !settings.alerts.weather) return false;
        if (alert.category === 'cropHealth' && !settings.alerts.cropHealth) return false;
        return true;
    });

    const SCHEMES = [
        { id: 1, title: t('schemData.pmKisan'), due: t('schemData.creditsDue'), icon: Wallet },
        { id: 2, title: t('schemData.dripSub'), due: t('schemData.closingSoon'), icon: Droplets },
        { id: 3, title: t('schemData.soilCard'), due: t('schemData.updateReq'), icon: FileText },
    ];

    if (dataLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen text-green-600 gap-2">
                    <Loader2 className="animate-spin" /> Loading Farm Data...
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-screen gap-4">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                    <h2 className="text-xl font-bold text-slate-800">Something went wrong</h2>
                    <p className="text-slate-500">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                        Retry
                    </button>
                    <div className="p-4 bg-slate-100 rounded-lg text-xs font-mono text-slate-600 max-w-lg overflow-auto">
                        Backend URL: /api/dashboard-stats
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <ExpenseModal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} />
            <MarketPricesModal isOpen={isMarketModalOpen} onClose={() => setIsMarketModalOpen(false)} />
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
                            <p className="text-slate-500 font-medium">{t('dashboard.welcome')}, {settings.profile.name || currentUser?.displayName || 'Farmer'}</p>
                        </div>
                        <div className="flex gap-2">
                            {/* Actions removed */}
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
                                <UnifiedAlertsCard alerts={activeAlerts} />
                            </div>

                            {/* PLANNER */}
                            <div className="md:col-span-2">
                                <UnifiedPlannerCard tasks={tasks} />
                            </div>
                        </div>

                        {/* RIGHT COLUMN (Farm Status) */}
                        <div className="lg:col-span-4 h-full">
                            <UnifiedStatusCard farmStatus={FARM_STATUS} />
                        </div>
                    </div>

                    {/* 4. Secondary Actions / Footer */}
                    <div className="space-y-4">
                        <QuickActionsBar
                            onLogExpense={() => setIsExpenseModalOpen(true)}
                            onUpdateStock={() => navigate('/inventory')}
                            onCheckPrices={() => setIsMarketModalOpen(true)}
                        />
                        <AdditionalResources schemes={SCHEMES} />
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
