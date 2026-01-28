import React, { useState } from 'react';
import { X, BookOpen, HelpCircle, Shield, Truck, DollarSign, TrendingUp } from 'lucide-react';

const GuideModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('guide'); // guide, faq, terms

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookOpen className="text-blue-600" /> Player's Handbook
                        </h2>
                        <p className="text-sm text-slate-500">Nexus Logistics Operations Manual</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} className="text-slate-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <TabButton id="guide" label="How to Play" icon={<Truck size={16} />} active={activeTab} set={setActiveTab} />
                    <TabButton id="faq" label="FAQ" icon={<HelpCircle size={16} />} active={activeTab} set={setActiveTab} />
                    <TabButton id="terms" label="Terms & Conditions" icon={<Shield size={16} />} active={activeTab} set={setActiveTab} />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/50">

                    {activeTab === 'guide' && (
                        <div className="space-y-6">
                            <Section
                                title="1. Acquire Customers"
                                icon={<DollarSign size={20} className="text-green-600" />}
                                text="Go to the Sales Tab to bid on contracts. High Volume customers give more loads but demand lower rates. Balance your portfolio!"
                            />
                            <Section
                                title="2. Cover Freight"
                                icon={<Truck size={20} className="text-indigo-600" />}
                                text="In the TMS Tab, select available loads and book carriers. Match equipment types (e.g. Reefer for Refrigerated) to avoid claims."
                            />
                            <Section
                                title="3. Manage Margins"
                                icon={<TrendingUp size={20} className="text-blue-600" />}
                                text="Buy low, sell high. Reliable carriers cost more but arrive on time. Cheap carriers risk breakdowns. Your goal is Net Profit."
                            />
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-300">
                                <strong>💡 Pro Tip:</strong> Use the "Auto Pilot" toggle to automate low-margin booking once you scale up.
                            </div>
                        </div>
                    )}

                    {activeTab === 'faq' && (
                        <div className="space-y-4">
                            <FAQ q="Why did I lose money on a load?" a="If a carrier breaks down or is late, you may pay penalties. Also, booking expensive carriers on cheap freight kills margins." />
                            <FAQ q="What is 'Headhaul' vs 'Backhaul'?" a="Headhaul loads (leaving a hub) pay more. Backhaul loads (returning to a hub) pay less. Market conditions matter!" />
                            <FAQ q="How do I unlock more cities?" a="Acquire customers in different regions. The map expands as your network grows." />
                            <FAQ q="What happens if Reputation hits 0?" a="Game Over. Customers will pull contracts and you will go bankrupt." />
                        </div>
                    )}

                    {activeTab === 'terms' && (
                        <div className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-400">
                            <p><strong>1. Acceptance:</strong> By playing Nexus Logistics, you agree to manage virtual freight responsibly.</p>
                            <p><strong>2. Liability:</strong> This is a simulation. No real cargo is moved. We are not responsible for addiction to high margins.</p>
                            <p><strong>3. Data:</strong> Your game progress is saved locally in your browser. Clearing cache will wipe your empire.</p>
                            <p className="mt-4 text-xs uppercase tracking-widest font-bold text-slate-300">© 2026 Antigravity Research</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm transition-all"
                    >
                        Got it, Let's Roll!
                    </button>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, set }) => (
    <button
        onClick={() => set(id)}
        className={`flex-1 py-4 flex items-center justify-center gap-2 text-sm font-bold border-b-2 transition-colors ${active === id
                ? 'border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
    >
        {icon} {label}
    </button>
);

const Section = ({ title, icon, text }) => (
    <div className="flex gap-4">
        <div className="shrink-0 p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm h-fit border border-slate-100 dark:border-slate-700">
            {icon}
        </div>
        <div>
            <h3 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{text}</p>
        </div>
    </div>
);

const FAQ = ({ q, a }) => (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="bg-white dark:bg-slate-800 p-3 font-bold text-slate-800 dark:text-slate-200 flex gap-2">
            <HelpCircle size={18} className="text-blue-500 shrink-0" /> {q}
        </div>
        <div className="p-3 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-700">
            {a}
        </div>
    </div>
);

export default GuideModal;
