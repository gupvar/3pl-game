import React, { useState } from 'react';
import { useGame, useTheme } from '../context/GameContext';
import { Sun, Moon, Map as MapIcon, Truck, Users, BarChart3, MapPin, Menu, X, BookOpen, Zap } from 'lucide-react';
import MapOverlay from './MapOverlay';

const Layout = ({ children, activeTab, setActiveTab }) => {
    const { state, dispatch } = useGame();
    const { theme, toggleTheme } = useTheme();
    const [showMap, setShowMap] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleNavClick = (id) => {
        setActiveTab(id);
        setMobileMenuOpen(false); // Close menu on selection on mobile
    };

    return (
        <div className="flex h-screen bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans overflow-hidden transition-colors duration-300">

            {/* Mobile Header Overlay */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-30 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                    <span className="font-bold text-slate-800 dark:text-white">Nexus</span>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-300">
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar (Desktop: Static, Mobile: Fixed/Slide-over) */}
            <aside className={`
                fixed md:static inset-y-0 left-0 w-64 bg-white text-slate-600 border-r border-slate-200 
                transform transition-transform duration-300 ease-in-out z-40 flex flex-col shadow-xl md:shadow-none
                ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                top-16 md:top-0 h-[calc(100vh-4rem)] md:h-screen
            `}>
                <div className="hidden md:flex p-6 border-b border-slate-100 items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">N</div>
                    <div>
                        <h1 className="font-bold text-lg tracking-tight leading-none text-slate-800">Nexus</h1>
                        <span className="text-[10px] text-indigo-600 font-bold tracking-wider uppercase">LOGISTICS SYSTEM</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavItem icon={<Users size={20} />} label="Sales / Customers" id="sales" active={activeTab} onClick={handleNavClick} />
                    <NavItem icon={<Truck size={20} />} label="TMS / Orders" id="tms" active={activeTab} onClick={handleNavClick} count={state.loads.filter(l => l.status === 'Available').length} />
                    <NavItem icon={<MapIcon size={20} />} label="Load Board" id="brokerage" active={activeTab} onClick={handleNavClick} />
                    <NavItem icon={<BarChart3 size={20} />} label="Analytics" id="analytics" active={activeTab} onClick={handleNavClick} />
                    <div className="my-2 border-t border-slate-100"></div>
                    <NavItem icon={<BookOpen size={20} />} label="Knowledge Base" id="wiki" active={activeTab} onClick={handleNavClick} />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    {/* Auto Pilot Toggle */}
                    <button
                        onClick={() => dispatch({ type: 'TOGGLE_AUTOPILOT' })}
                        className={`w-full mb-3 py-2 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all border ${state.autoPilot
                            ? 'bg-amber-100 text-amber-700 border-amber-300'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                            }`}
                    >
                        <Zap size={16} className={state.autoPilot ? 'fill-current' : ''} />
                        {state.autoPilot ? 'Auto Pilot: ON' : 'Auto Pilot: OFF'}
                    </button>

                    <button
                        onClick={() => {
                            // 1. Traverse trucks significantly (Simulate transit)
                            dispatch({ type: 'ADVANCE_LOADS' });

                            // 2. Generate new loads & Move Day Forward
                            import('../utils/gameLogic').then(module => {
                                const newLoads = module.generateLoadsForDay(state.customers, state.day + 1);
                                dispatch({ type: 'ADD_LOADS', payload: newLoads });
                                dispatch({ type: 'NEXT_DAY' });
                            });
                        }}
                        className="w-full mb-3 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-bold shadow-md transition-all active:scale-95 flex justify-center items-center gap-2 text-sm"
                    >
                        End Day {state.day} &rarr;
                    </button>

                    <div className="bg-slate-50 rounded p-3 text-sm border border-slate-200">
                        <div className="font-mono font-bold text-emerald-600 text-lg">${state.userProfile.cash.toLocaleString()}</div>
                        <div className="flex justify-between mt-1 text-xs text-slate-500">
                            <span>Rep: {state.userProfile.reputation}%</span>
                            <span>Lvl {state.userProfile.level}</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden pt-16 md:pt-0">
                <header className="hidden md:flex h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 justify-between items-center px-6 shadow-sm z-10 transition-colors duration-300">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        {activeTab === 'sales' && 'Customer Acquisition'}
                        {activeTab === 'tms' && 'Order Management'}
                        {activeTab === 'brokerage' && 'Freight Brokerage'}
                        {activeTab === 'analytics' && 'Company Performance'}
                        {activeTab === 'wiki' && 'Knowledge Base'}
                    </h2>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowMap(!showMap)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold transition-all ${showMap
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                                }`}
                        >
                            <MapPin size={16} />
                            {showMap ? 'Hide Map' : 'Show Map'}
                        </button>

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
                    {/* Dynamic Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

                    <div className="relative z-10 w-full h-full pb-32 flex flex-col">
                        <div className="flex-1">
                            {children}
                        </div>
                    </div>
                </div>

                {/* Map Overlay & Mobile Floating Map Button */}
                {showMap && <MapOverlay onClose={() => setShowMap(false)} />}

                {/* Mobile FAB for Map */}
                <button
                    onClick={() => setShowMap(!showMap)}
                    className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-105 transition-transform"
                >
                    <MapPin size={24} />
                </button>
            </main>
        </div>
    );
};

const NavItem = ({ icon, label, id, active, onClick, count }) => (
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group ${active === id
            ? 'bg-indigo-50 text-indigo-600 font-bold shadow-sm ring-1 ring-indigo-100'
            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
    >
        <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
        </div>
        {count > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                {count}
            </span>
        )}
    </button>
);

export default Layout;
