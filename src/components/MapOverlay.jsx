import React from 'react';
import { CITIES } from '../data/gameData';
import { useGame } from '../context/GameContext';
import { X } from 'lucide-react';

const MapOverlay = ({ onClose }) => {
    const { state } = useGame();

    // We only want to visualize "recent" history or active loads?
    // Let's visualize the LAST 5 shipments status
    const recentHistory = state.history.slice(-5);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-[400px] bg-white dark:bg-slate-900 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] border-t border-slate-200 dark:border-slate-700 z-[100] flex flex-col md:flex-row transition-transform duration-300 transform translate-y-0">
            {/* Map Area */}
            <div className="flex-2 w-2/3 bg-blue-50 dark:bg-slate-800 relative p-4 overflow-hidden">
                <button onClick={onClose} className="absolute top-4 right-4 bg-white dark:bg-slate-700 p-2 rounded-full shadow hover:bg-slate-100 z-10">
                    <X size={20} />
                </button>

                <h3 className="absolute top-4 left-4 font-bold text-slate-500 uppercase tracking-widest text-xs z-10">Network Map</h3>

                <svg viewBox="0 0 400 450" className="w-full h-full opacity-80" preserveAspectRatio="xMidYMid meet">
                    {/* Simplified Georgia Shape */}
                    <path d="M 120,20 L 280,40 L 350,200 L 380,300 L 350,400 L 250,440 L 150,440 L 50,400 L 20,200 Z"
                        fill="currentcolor" className="text-white dark:text-slate-700" stroke="#cbd5e1" strokeWidth="2" />

                    {/* Lanes */}
                    {recentHistory.map((h, idx) => {
                        // Safeguard: Ensure history item has valid structure
                        if (!h || !h.loadId) return null;

                        const load = state.loads.find(l => l.id === h.loadId);

                        // Fallback: use history item's own origin/dest if saved (Fixed in GameContext)
                        const originName = load ? load.origin : (h.origin || (h.quote && h.quote.origin));
                        const destName = load ? load.dest : (h.dest || (h.quote && h.quote.dest));

                        if (!originName || !destName) return null;

                        const originCity = CITIES[originName];
                        const destCity = CITIES[destName];

                        if (!originCity || !destCity) return null;

                        return (
                            <line
                                key={idx}
                                x1={originCity.x} y1={originCity.y}
                                x2={destCity.x} y2={destCity.y}
                                stroke={h.success ? "#22c55e" : "#ef4444"}
                                strokeWidth="2"
                                strokeDasharray="4"
                                className="opacity-60"
                            />
                        );
                    })}

                    {/* Cities */}
                    {Object.entries(CITIES).map(([name, data]) => (
                        <g key={name}>
                            <circle cx={data.x} cy={data.y} r="6" className="fill-slate-700 dark:fill-slate-300" />
                            <text x={data.x + 10} y={data.y + 4} fontSize="12" className="fill-slate-600 dark:fill-slate-400 font-bold">{name}</text>
                            <text x={data.x + 10} y={data.y + 16} fontSize="9" className="fill-slate-400 dark:fill-slate-500 uppercase">{data.label}</text>
                        </g>
                    ))}
                </svg>
            </div>

            {/* Lane Log */}
            <div className="flex-1 w-1/3 p-6 overflow-auto bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800">
                <h4 className="font-bold mb-4 text-slate-800 dark:text-slate-200">Recent Activity</h4>
                <ul className="space-y-3 text-sm">
                    {state.history.length === 0 ? (
                        <li className="text-slate-500 italic">No shipments yet.</li>
                    ) : (
                        [...state.history].reverse().slice(0, 10).map((h, i) => (
                            <li key={i} className={`flex items-start gap-2 ${h.success ? 'text-green-600' : 'text-red-500'}`}>
                                {h.success ? <CheckCircle size={16} className="mt-0.5 shrink-0" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0" />}
                                <div>
                                    <div className="font-bold">{h.quote.name}</div>
                                    <div className="text-slate-500 text-xs">{h.msg}</div>
                                    <div className="font-mono text-xs font-bold mt-1">
                                        {h.finalMargin > 0 ? '+' : ''}${h.finalMargin}
                                    </div>
                                </div>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MapOverlay;
