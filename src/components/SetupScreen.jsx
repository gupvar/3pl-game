import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Truck, Clock, BarChart, ShieldCheck } from 'lucide-react';

const SetupScreen = () => {
    const { dispatch } = useGame();
    const [name, setName] = useState("Broker");
    const [difficulty, setDifficulty] = useState("Normal");
    const [duration, setDuration] = useState("90"); // Days

    const startGame = () => {
        dispatch({
            type: 'START_GAME',
            payload: {
                playerName: name,
                difficulty,
                maxDays: duration === 'Endless' ? 9999 : parseInt(duration)
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-100 to-slate-200">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-blue-600">
                <div className="text-center mb-8">
                    <div className="inline-flex justify-center items-center w-16 h-16 bg-blue-600 rounded-xl text-white mb-4 shadow-lg shadow-blue-900/50">
                        <Truck size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Nexus Logistics</h1>
                    <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">Freight Brokerage Simulator</p>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Broker Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-800 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Game Duration</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['30', '90', 'Endless'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDuration(opt)}
                                    className={`p-3 rounded border text-sm font-bold transition-all ${duration === opt
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-400'
                                        }`}
                                >
                                    {opt === 'Endless' ? '∞' : `${opt} Days`}
                                </button>
                            ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 text-center">
                            {duration === '30' && "Quick Blitz: High pressure, short term."}
                            {duration === '90' && "Quarterly Season: Balanced standard play."}
                            {duration === 'Endless' && "Sandbox: Build an empire forever."}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Difficulty (Market Conditions)</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['Easy', 'Normal', 'Hard'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDifficulty(opt)}
                                    className={`p-3 rounded border text-sm font-bold transition-all ${difficulty === opt
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform scale-105'
                                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-emerald-400'
                                        }`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={startGame}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all transform active:scale-95 text-lg flex items-center justify-center gap-2 mt-4"
                    >
                        Start Career <Truck size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupScreen;
