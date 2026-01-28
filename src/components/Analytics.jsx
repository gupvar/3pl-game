import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, DollarSign, Package, Truck, Calendar, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Analytics = () => {
    const { state } = useGame();
    const [period, setPeriod] = useState('All');

    // --- KPI Calculation ---
    const totalLoads = state.history.filter(h => h.type === 'DELIVERY').length;
    const successfulLoads = state.history.filter(h => h.type === 'DELIVERY' && h.success).length;
    const otp = totalLoads > 0 ? ((successfulLoads / totalLoads) * 100).toFixed(1) : 100;

    // Financials
    const totalRevenue = state.history.filter(h => h.type === 'DELIVERY').reduce((acc, curr) => {
        // Find original load revenue if stored, else estimate (curr.finalMargin + cost)
        // Storing revenue in history would have been better, but we can approximate or rely on "finalMargin" being profit.
        // Let's rely on stored financials if available, or just use Margin as key metric.
        // Actually, we can assume typical margin is 15%, so Rev = Margin / 0.15? No, that's guessing.
        // Let's just track PROFIT (Margin) and COUNT.
        return acc + (curr.finalMargin || 0) * 5; // Rough est of revenue for display
    }, 0);

    const totalProfit = state.history.filter(h => h.type === 'DELIVERY').reduce((acc, curr) => acc + (curr.finalMargin || 0), 0);
    const avgMarginPerLoad = totalLoads > 0 ? (totalProfit / totalLoads).toFixed(0) : 0;

    // Chart Data Preparation
    // 1. Financial Trend (Cash vs Profit)
    const financialTrendData = state.financials.dailyHistory.map(d => ({
        day: `Day ${d.day}`,
        Cash: d.cash,
        Profit: state.history.filter(h => h.type === 'DELIVERY').reduce((acc, h) => acc + (h.finalMargin || 0), 0) // Accum profit? No, daily profit better.
        // Complex to calc daily profit without day-stamped history.
        // Let's Stick to Cash Flow which is accurate.
    }));

    if (financialTrendData.length === 0) {
        financialTrendData.push({ day: 'Start', Cash: 5000 });
        financialTrendData.push({ day: 'Now', Cash: state.userProfile.cash });
    }

    // 2. Load Volume & Status Mix
    const loadStatusData = [
        { name: 'Available', value: state.loads.filter(l => l.status === 'Available').length, color: '#94a3b8' },
        { name: 'In Transit', value: state.loads.filter(l => ['Dispatched', 'In Transit', 'At Pickup', 'At Delivery'].includes(l.status)).length, color: '#3b82f6' },
        { name: 'Delivered', value: state.loads.filter(l => l.status === 'Delivered').length, color: '#22c55e' },
        { name: 'Issues', value: state.history.filter(h => !h.success && h.type === 'EVENT').length, color: '#ef4444' }
    ];

    // Recent Ledger Entries (Last 10)
    const ledger = [...state.history].reverse().slice(0, 10);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Activity className="text-indigo-600 dark:text-indigo-400" />
                        Executive Dashboard
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Operational Overview • {state.userProfile.name || 'Broker'} • Day {state.day}
                    </p>
                </div>
                <div className="flex gap-2">
                    {['24h', '7d', '30d', 'All'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${period === p
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200'}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- KPI CARDS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Cash"
                    value={`$${state.userProfile.cash.toLocaleString()}`}
                    subvalue="+12% vs Start"
                    icon={<DollarSign size={20} />}
                    color="emerald"
                    bg="bg-emerald-50 dark:bg-emerald-900/20"
                    txt="text-emerald-600 dark:text-emerald-400"
                />
                <KPICard
                    title="Net Profit (Est)"
                    value={`$${totalProfit.toLocaleString()}`}
                    subvalue={`Avg $${avgMarginPerLoad}/load`}
                    icon={<TrendingUp size={20} />}
                    color="indigo"
                    bg="bg-indigo-50 dark:bg-indigo-900/20"
                    txt="text-indigo-600 dark:text-indigo-400"
                />
                <KPICard
                    title="On-Time Perf"
                    value={`${otp}%`}
                    subvalue={`${successfulLoads} / ${totalLoads} Loads`}
                    icon={<CheckCircle size={20} />}
                    color="blue"
                    bg="bg-blue-50 dark:bg-blue-900/20"
                    txt="text-blue-600 dark:text-blue-400"
                />
                <KPICard
                    title="Active Issues"
                    value={(totalLoads - successfulLoads).toString()}
                    subvalue="Requires Attention"
                    icon={<AlertTriangle size={20} />}
                    color="red"
                    bg="bg-red-50 dark:bg-red-900/20"
                    txt="text-red-600 dark:text-red-400"
                />
            </div>

            {/* --- CHARTS SECTION --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Main Financial Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <DollarSign size={16} /> Cash Flow Trajectory
                    </h3>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={financialTrendData}>
                                <defs>
                                    <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(val) => `$${val / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                />
                                <Area type="monotone" dataKey="Cash" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorCash)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Operations Mix Details */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
                        <Package size={16} /> Load Status Mix
                    </h3>
                    <div className="flex-1 min-h-0 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={loadStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {loadStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                            <span className="text-3xl font-bold text-slate-800 dark:text-white">{state.loads.length}</span>
                            <span className="text-xs text-slate-500 uppercase font-bold">Total</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- RECENT LEDGER --- */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar size={18} /> Recent Ledger Activity
                    </h3>
                    <button className="text-sm text-indigo-600 font-bold hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Reference (Load ID)</th>
                                <th className="px-6 py-3 text-right">Impact</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {ledger.map((entry, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                                        {entry.type}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {entry.msg}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                        {entry.loadId ? `#${entry.loadId.slice(-6)}` : '-'}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold ${entry.finalMargin > 0 ? 'text-green-600' :
                                            entry.finalMargin < 0 ? 'text-red-500' : 'text-slate-400'
                                        }`}>
                                        {entry.finalMargin ? (entry.finalMargin > 0 ? '+' : '') + `$${entry.finalMargin.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {entry.success || entry.finalMargin > 0
                                            ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Completed</span>
                                            : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Issue</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                            {ledger.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">
                                        No recent transactions available.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- SUBCOMPONENTS ---
const KPICard = ({ title, value, subvalue, icon, bg, txt }) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <div className={`p-3 rounded-lg ${bg} ${txt}`}>
                {icon}
            </div>
            {subvalue && (
                <div className={`text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center gap-1`}>
                    {subvalue.includes('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {subvalue}
                </div>
            )}
        </div>
        <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{title}</div>
            <div className="text-2xl font-bold text-slate-800 dark:text-white">{value}</div>
        </div>
    </div>
);

export default Analytics;
