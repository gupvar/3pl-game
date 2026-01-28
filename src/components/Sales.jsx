import React from 'react';
import { useGame } from '../context/GameContext';
import { CUSTOMER_DATABASE } from '../data/gameData';
import { Building2, DollarSign, Briefcase } from 'lucide-react';
import Tooltip from './Tooltip';

const Sales = () => {
    const { state, dispatch } = useGame();

    // Filter out customers explicitly already acquired
    // For MVP, we can just check if ID is in state.customers
    const acquiredIds = state.customers.map(c => c.id);
    const prospects = CUSTOMER_DATABASE.filter(c => !acquiredIds.includes(c.id));

    const handleAcquire = (customer) => {
        if (state.userProfile.cash < customer.fee) {
            alert("Insufficient Funds!");
            return;
        }
        dispatch({ type: 'ACQUIRE_CUSTOMER', payload: { ...customer, cost: customer.fee } });
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Briefcase className="text-blue-500" />
                    Active Contracts
                </h3>
                {state.customers.length === 0 ? (
                    <p className="text-slate-500 italic">
                        No active contracts. Visit the
                        <Tooltip term="Spot Market" definition="Freight that is not under contract. Prices fluctuate daily based on supply (trucks) and demand (loads)." />
                        list below to acquire customers.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {state.customers.map(c => (
                            <div key={c.id} className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 p-4 rounded-lg">
                                <div className="font-bold text-slate-800 dark:text-slate-200">{c.name}</div>
                                <div className="text-sm text-slate-500">{c.comm} • {c.mode}</div>
                                <div className="mt-2 text-xs font-mono text-green-700 dark:text-green-400">Volume: {c.volume}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <Building2 className="text-yellow-500" />
                    Prospect List (Spot Market)
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    {prospects.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-yellow-400 transition-colors">
                            <div>
                                <div className="font-bold text-lg text-slate-800 dark:text-slate-200">{p.name}</div>
                                <div className="text-sm text-slate-500">{p.comm} ({p.req})</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">${p.fee.toLocaleString()}</div>
                                <button
                                    onClick={() => handleAcquire(p)}
                                    className="mt-1 bg-yellow-400 hover:bg-yellow-500 text-slate-900 px-4 py-2 rounded font-bold text-sm flex items-center gap-2"
                                >
                                    <DollarSign size={14} /> Bid Contract
                                </button>
                            </div>
                        </div>
                    ))}
                    {prospects.length === 0 && (
                        <p className="text-slate-500">All available customers acquired!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Sales;
