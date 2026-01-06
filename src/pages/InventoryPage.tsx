import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import {
    Package, Archive, AlertTriangle, TrendingDown, TrendingUp,
    Plus, Download, ShoppingCart, Calendar, History,
    Droplets, Sprout, Hammer, Users, CheckCircle,
    AlertCircle, RefreshCw, BrainCircuit
} from 'lucide-react';
import { clsx } from 'clsx';

import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';

// --- Types ---

type Category = 'Seeds' | 'Fertilizers' | 'Pesticides' | 'Tools' | 'Labor' | 'Water';

interface InventoryItem {
    id: string;
    name: string;
    category: Category;
    quantity: number;
    unit: string;
    minThreshold: number;
    expiryDate?: string;
    batchNumber?: string;
    lastRestocked: string;
    pricePerUnit: number;
}

interface HistoricalLog {
    id: string;
    date: string;
    itemName: string;
    action: 'Used' | 'Restocked';
    quantity: number;
    unit: string;
    relatedTask?: string; // Link to planner task
}

// --- Mock Data ---

// Mock data removed in favor of API


const CATEGORIES: { name: Category; icon: React.ElementType; color: string }[] = [
    { name: 'Seeds', icon: Sprout, color: 'text-green-600 bg-green-50' },
    { name: 'Fertilizers', icon: Package, color: 'text-amber-600 bg-amber-50' },
    { name: 'Pesticides', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { name: 'Water', icon: Droplets, color: 'text-blue-600 bg-blue-50' },
    { name: 'Tools', icon: Hammer, color: 'text-gray-600 bg-gray-50' },
    { name: 'Labor', icon: Users, color: 'text-purple-600 bg-purple-50' },
];

// --- Components ---

function StatusBadge({ quantity, threshold, expiry }: { quantity: number, threshold: number, expiry?: string }) {
    const isLow = quantity <= threshold;
    const isExpiringSoon = expiry && new Date(expiry) < new Date(new Date().setMonth(new Date().getMonth() + 1)); // 1 month warning

    if (isLow) {
        return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100"><AlertCircle className="w-3 h-3" /> Low Stock</span>;
    }
    if (isExpiringSoon) {
        return <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100"><Calendar className="w-3 h-3" /> Expiring Soon</span>;
    }
    return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100"><CheckCircle className="w-3 h-3" /> In Stock</span>;
}

export default function InventoryPage() {
    const [filterCat, setFilterCat] = useState<Category | 'All'>('All');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [logs, setLogs] = useState<HistoricalLog[]>([]);

    // Fetch Data from API
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const [invRes, logsRes] = await Promise.all([
                    fetch('/api/inventory'),
                    fetch('/api/inventory/logs')
                ]);
                const invData = await invRes.json();
                const logsData = await logsRes.json();
                setItems(invData);
                setLogs(logsData);
            } catch (error) {
                console.error("Failed to fetch inventory data", error);
            }
        };
        fetchData();
    }, []);

    // Derived Logic
    const filteredItems = items.filter(i => filterCat === 'All' || i.category === filterCat);
    const lowStockItems = items.filter(i => i.quantity <= i.minThreshold);
    const totalValue = items.reduce((acc, i) => acc + (i.quantity * i.pricePerUnit), 0);

    const chartData = items.map(i => ({
        name: i.name.split(' ')[0], // Short name
        quantity: i.quantity,
        threshold: i.minThreshold
    })).slice(0, 6); // Just top 6 for demo

    return (
        <DashboardLayout>
            <div className="min-h-screen relative pb-20 bg-gray-50/50">
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-5 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Archive className="w-6 h-6 text-indigo-600" />
                                Inventory Management
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">Track inputs, monitor stock levels, and automate replenishment.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition">
                                <Download className="w-4 h-4" /> Export Report
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition">
                                <Plus className="w-4 h-4" /> Add Item
                            </button>
                        </div>
                    </div>

                    {/* Quick Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Stock Value</h3>
                            <div className="text-2xl font-extrabold text-gray-900">₹{totalValue.toLocaleString()}</div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Low Stock Alerts</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold text-red-600">{lowStockItems.length}</span>
                                <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-full">Action Needed</span>
                            </div>
                        </div>
                        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upcoming Expiry</h3>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-extrabold text-orange-500">1</span>
                                <span className="text-xs text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-full">Item</span>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-5 rounded-2xl text-white shadow-lg shadow-indigo-600/20 flex flex-col justify-between relative overflow-hidden">
                            <ShoppingCart className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10" />
                            <h3 className="text-xs font-bold opacity-80 uppercase tracking-wider mb-2">Replenishment</h3>
                            <div>
                                <div className="font-bold text-lg mb-1">Buy Wheat Seeds</div>
                                <div className="text-xs opacity-75">Predicted need: Nov 10</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: Inventory List */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Tabs/Filter */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                                <button
                                    onClick={() => setFilterCat('All')}
                                    className={clsx("px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition", filterCat === 'All' ? "bg-gray-800 text-white" : "bg-white text-gray-600 hover:bg-gray-100")}
                                >
                                    All Items
                                </button>
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.name}
                                        onClick={() => setFilterCat(cat.name)}
                                        className={clsx("px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap flex items-center gap-2 transition",
                                            filterCat === cat.name ? "bg-white ring-2 ring-indigo-600 text-indigo-700" : "bg-white text-gray-600 hover:bg-gray-100")}
                                    >
                                        <cat.icon className="w-4 h-4" />
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* List Table */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <div className="md:hidden space-y-4 p-4">
                                        {filteredItems.map(item => {
                                            const CategoryIcon = CATEGORIES.find(c => c.name === item.category)?.icon || Package;
                                            return (
                                                <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 relative">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="font-bold text-gray-900">{item.name}</div>
                                                            <div className="font-mono text-xs text-gray-400 mt-0.5">{item.batchNumber}</div>
                                                        </div>
                                                        <StatusBadge quantity={item.quantity} threshold={item.minThreshold} expiry={item.expiryDate} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                                        <div>
                                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Category</span>
                                                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mt-1">
                                                                <CategoryIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                                {item.category}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Stock</span>
                                                            <div className="text-sm font-bold text-gray-900 mt-1">
                                                                {item.quantity} <span className="text-gray-400 font-normal">{item.unit}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {item.expiryDate && (
                                                        <div className="bg-gray-50 rounded-lg p-2 text-xs text-gray-500 flex items-center gap-2 mb-3">
                                                            <Calendar className="w-3 h-3" />
                                                            Expires: <span className="font-medium text-gray-700">{new Date(item.expiryDate).toLocaleDateString()}</span>
                                                        </div>
                                                    )}
                                                    <button className="w-full py-2 bg-indigo-50 text-indigo-600 font-bold text-xs rounded-lg hover:bg-indigo-100 transition">
                                                        Restock / Update
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <table className="w-full text-left hidden md:table">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Quantity</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider font-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {filteredItems.map(item => {
                                                const CategoryIcon = CATEGORIES.find(c => c.name === item.category)?.icon || Package;
                                                return (
                                                    <tr key={item.id} className="hover:bg-gray-50/50 transition cursor-pointer group">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-800">{item.name}</div>
                                                            {item.batchNumber && <div className="text-[10px] text-gray-400 font-mono">Batch: {item.batchNumber}</div>}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="flex items-center gap-2 text-sm text-gray-600">
                                                                <CategoryIcon className="w-4 h-4 text-gray-400" />
                                                                {item.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-mono font-bold text-gray-800">
                                                                {item.quantity} <span className="text-gray-400 text-xs font-sans">{item.unit}</span>
                                                            </div>
                                                            {item.expiryDate && (
                                                                <div className="text-[10px] text-gray-400 mt-1">Exp: {new Date(item.expiryDate).toLocaleDateString()}</div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <StatusBadge quantity={item.quantity} threshold={item.minThreshold} expiry={item.expiryDate} />
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                                <RefreshCw className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {filteredItems.length === 0 && (
                                    <div className="p-12 text-center text-gray-400 text-sm">No items found in this category.</div>
                                )}
                            </div>

                            {/* Consumption History */}
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                                <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
                                    <History className="w-5 h-5 text-gray-500" /> Recent Activity Log
                                </h3>
                                <div className="space-y-4">
                                    {logs.map(log => (
                                        <div key={log.id} className="flex items-start gap-4 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                            <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                                log.action === 'Used' ? "bg-amber-100 text-amber-600" : "bg-green-100 text-green-600"
                                            )}>
                                                {log.action === 'Used' ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="text-sm font-bold text-gray-800">{log.action} {log.itemName}</h4>
                                                    <span className="text-xs text-gray-400">{log.date}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">
                                                        {log.action === 'Used' ? '-' : '+'}{log.quantity}{log.unit}
                                                    </span>
                                                    {log.relatedTask && (
                                                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                                            via Task: <span className="underline decoration-dotted">{log.relatedTask}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Visuals & Analytics */}
                        <div className="space-y-6">

                            {/* Stock Level Chart */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                <h3 className="font-bold text-gray-800 mb-4">Stock Levels Overview</h3>
                                <div className="h-48 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.quantity <= entry.threshold ? '#dc2626' : '#4f46e5'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 flex gap-4 justify-center text-[10px] text-gray-500">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-600" /> Healthy</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-600" /> Low Stock</div>
                                </div>
                            </div>

                            {/* Auto Replenish Suggestion */}
                            <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6 shadow-lg shadow-gray-900/10">
                                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                                    <BrainCircuit className="w-5 h-5 text-purple-400" />
                                    Smart Suggestion
                                </h4>
                                <p className="text-sm opacity-80 leading-relaxed mb-6">
                                    Based on your "Wheat Sowing" task scheduled for Nov 10, you are short on <strong>5 kg of Seeds</strong>.
                                </p>
                                <button className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm hover:bg-gray-100 transition flex items-center justify-center gap-2">
                                    <ShoppingCart className="w-4 h-4" /> Order Now via Co-op
                                </button>
                                <div className="mt-4 text-center">
                                    <button className="text-xs text-gray-400 underline hover:text-white">View Recommended Suppliers</button>
                                </div>
                            </div>

                            {/* Alert Box */}
                            {lowStockItems.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
                                    <h4 className="font-bold text-red-800 text-sm mb-3 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Attention Needed
                                    </h4>
                                    <ul className="space-y-2">
                                        {lowStockItems.map(item => (
                                            <li key={item.id} className="text-xs text-red-700 flex justify-between">
                                                <span>{item.name}</span>
                                                <span className="font-bold">{item.quantity} {item.unit} left</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                        </div>
                    </div>

                </div>
            </div>
        </DashboardLayout>
    );
}
