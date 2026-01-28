import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { CARRIERS } from '../data/gameData';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

const Brokerage = () => {
    const { state, dispatch } = useGame();
    const activeLoad = state.loads.find(l => l.id === state.activeLoadId);

    // State
    const [quotes, setQuotes] = useState([]);
    const [autoPlay, setAutoPlay] = useState(false);
    const [successData, setSuccessData] = useState(null);

    // 1. Generate Quotes when load changes
    useEffect(() => {
        if (activeLoad) {
            const newQuotes = [];
            for (let i = 0; i < 3; i++) {
                const baseC = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];

                // Adjust cost based on reliability
                let costFactor = 1.0;
                if (baseC.score > 90) costFactor = 1.1; // Expensive
                if (baseC.score < 75) costFactor = 0.8; // Cheap

                // Logic: Is this carrier equipped?
                let equipmentMatch = true;
                if (baseC.fleet !== 'Any' && baseC.fleet !== activeLoad.mode && activeLoad.mode !== 'Power Only') {
                    costFactor = 1.5; // Very expensive if mismatch (outsourcing)
                    equipmentMatch = false;
                }

                const cost = Math.floor(activeLoad.baseCost * costFactor * (0.9 + Math.random() * 0.2));
                const margin = activeLoad.revenue - cost;

                newQuotes.push({
                    id: i,
                    ...baseC,
                    cost,
                    margin,
                    equipmentMatch,
                    driver: ['Bob', 'Sarah', 'Mike', 'Big Al'][Math.floor(Math.random() * 4)],
                    truck: 2018 + Math.floor(Math.random() * 6)
                });
            }
            setQuotes(newQuotes);
        }
    }, [activeLoad]);

    // 2. Auto-Play Logic using quotes
    useEffect(() => {
        let timer;
        // Only auto-play if we have active load, quotes are ready, and not already showing success
        if (autoPlay && activeLoad && quotes.length > 0 && !successData) {
            timer = setTimeout(() => {
                // Determine best quote (Smart Strategy)
                // Score = Margin * (Reliability / 100)^3
                // This penalizes low reliability exponentially while still caring about profit.
                const scoredQuotes = quotes.filter(q => q.equipmentMatch).map(q => ({
                    ...q,
                    valueScore: q.margin * Math.pow(q.score / 100, 3)
                }));

                // Sort by Value Score
                const bestQuote = scoredQuotes.sort((a, b) => b.valueScore - a.valueScore)[0];

                if (bestQuote) handleBook(bestQuote);
            }, 3000); // 3 second delay for observation
        }
        return () => clearTimeout(timer);
    }, [autoPlay, activeLoad, quotes, successData]);

    const handleBook = (quote) => {
        // Validation & Risk Logic
        let success = true;
        let finalMargin = quote.margin;
        let msg = "Load Delivered Successfully.";
        let penalty = 0;

        // 1. Equipment Mismatch Risk (Critical)
        if (!quote.equipmentMatch) {
            success = false;
            msg = `CRITICAL FAILURE: You booked a ${quote.fleet} for a ${activeLoad.mode} load! Product spoiled/rejected.`;
            penalty = 1000;
            finalMargin -= penalty;
        }
        // 2. Reliability Roll
        else if (Math.random() * 100 > quote.score) {
            success = false;
            msg = `DELAY: ${quote.name} broke down. Customer is angry.`;
            penalty = 200;
            finalMargin -= penalty;
        }

        const result = {
            loadId: activeLoad.id,
            quote,
            finalMargin,
            success,
            msg,
            penalty
        };

        // Show success screen instead of alert
        setSuccessData(result);
    };

    const confirmBooking = () => {
        if (!successData) return;

        // Dispatch Updates
        dispatch({ type: 'UPDATE_CASH', payload: successData.finalMargin });
        dispatch({ type: 'UPDATE_REP', payload: successData.success ? 1 : -10 });
        dispatch({ type: 'BOOK_LOAD', payload: successData });

        // GAME FLOW FIX: Navigate back to TMS to select next load
        setSuccessData(null);
        dispatch({ type: 'NAVIGATE', payload: 'tms' });
    };

    // Auto-confirm effect for Auto-Play
    useEffect(() => {
        if (autoPlay && successData) {
            const timer = setTimeout(confirmBooking, 2000);
            return () => clearTimeout(timer);
        }
    }, [autoPlay, successData]);

    // RENDER: Success Screen
    if (successData) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-8 animate-in fade-in zoom-in duration-300">
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center border-t-8 border-green-500">
                    <div className="mb-6 flex justify-center">
                        {successData.success ? (
                            <CheckCircle size={64} className="text-green-500" />
                        ) : (
                            <XCircle size={64} className="text-red-500" />
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        {successData.success ? "Carrier Dispatched" : "Booking Failed"}
                    </h2>
                    <p className="text-slate-500 mb-6">{successData.msg}</p>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl mb-6 flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-500 uppercase">Est. Net Profit</span>
                        <span className={`text-2xl font-mono font-bold ${successData.finalMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${successData.finalMargin.toLocaleString()}
                        </span>
                    </div>

                    <button
                        onClick={confirmBooking}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                    >
                        Continue
                    </button>
                    {autoPlay && <p className="text-xs text-slate-400 mt-2 animate-pulse">Auto-continuing...</p>}
                </div>
            </div>
        );
    }

    // RENDER: No Load State (Safe Handling)
    if (!activeLoad && !successData) {
        return (
            <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                <ArrowLeft size={48} className="mb-4 text-slate-300" />
                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400">No Active Load Selected</h2>
                <p className="mb-6 text-center max-w-md">
                    Return to <strong>Order Management (TMS)</strong> to select a load.<br />
                    Once selected, you can broker it here.
                </p>
                <div className="animate-pulse text-xs text-blue-500 mt-4">Waiting for selection...</div>
            </div>
        );
    }

    // Guard: If we are transitioning (no load but somehow successData lingers or vice versa), return null to avoid crash
    if (!activeLoad && successData) return null; // Should not happen with above logic but safe guard

    // RENDER: Main Brokerage UI
    return (
        <div className="w-full space-y-6 animate-in slide-in-from-right duration-500">
            {/* Header with Auto-Play Toggle */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Freight Brokerage</h2>
                <button
                    onClick={() => setAutoPlay(!autoPlay)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${autoPlay
                        ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-400 ring-offset-2'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                >
                    {autoPlay ? 'Auto-Pilot ON' : 'Auto-Pilot OFF'}
                </button>
            </div>

            {/* Load Details Header */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-xs font-bold text-blue-500 uppercase tracking-wide mb-1">Active Load #{activeLoad.id.slice(-6)}</div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            {activeLoad.origin} <span className="text-slate-400">→</span> {activeLoad.dest}
                        </h2>
                        <div className="text-slate-500 mt-1 font-medium">{activeLoad.custName} • {activeLoad.dist} miles</div>
                    </div>
                    <div className="text-right">
                        <div className="text-xs text-slate-500 uppercase font-bold">Target Revenue</div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 font-mono">${activeLoad.revenue.toLocaleString()}</div>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                    <div className="p-3">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Equipment</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{activeLoad.mode}</div>
                    </div>
                    <div className="p-3 border-l border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Commodity</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{activeLoad.comm}</div>
                    </div>
                    <div className="p-3 border-l border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Requirements</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{activeLoad.req}</div>
                    </div>
                    <div className="p-3 border-l border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Market</div>
                        <div className="font-bold text-slate-700 dark:text-slate-200 text-lg">{activeLoad.market}</div>
                    </div>
                </div>
            </div>

            {/* Carrier List */}
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-8 flex items-center gap-2">
                Available Carriers
                <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-500 px-2 py-1 rounded-full">{quotes.length} Quotes</span>
            </h3>
            <div className="grid grid-cols-1 gap-4">
                {quotes.map((quote) => {
                    // Smart Strategy calculation for highlighting
                    const valueScore = quote.margin * Math.pow(quote.score / 100, 3);

                    // Simple logic to check if this is likely the best one (we duplicate logic or hoist it)
                    // For UI simplicity, let's just highlight if it's the high scorer
                    const isBest = quote.equipmentMatch && valueScore === Math.max(...quotes.filter(q => q.equipmentMatch).map(q => q.margin * Math.pow(q.score / 100, 3)));

                    return (
                        <div key={quote.id} className={`bg-white dark:bg-slate-800 p-0 rounded-lg shadow-sm border ${autoPlay && isBest ? 'border-purple-500 ring-2 ring-purple-200' : 'border-slate-200 dark:border-slate-700'} hover:border-blue-400 transition-all flex flex-col md:flex-row overflow-hidden group relative`}>
                            {isBest && autoPlay && (
                                <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl uppercase tracking-wider z-10">
                                    AI Choice
                                </div>
                            )}

                            {/* Carrier Info Left */}
                            <div className="flex-1 p-5 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-700">
                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-slate-500 shadow-inner">
                                    {quote.name[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-slate-800 dark:text-slate-200 leading-tight">{quote.name}</div>
                                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                                        <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{quote.fleet}</span>
                                        <span>•</span>
                                        <span>Driver: {quote.driver}</span>
                                        <span>•</span>
                                        <span>{quote.truck}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Middle */}
                            <div className="px-6 py-4 flex items-center justify-between md:justify-center gap-8 min-w-[200px] bg-slate-50/50 dark:bg-slate-900/50">
                                <div className="text-center">
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Reliability</div>
                                    <div className={`font-bold ${quote.score > 90 ? 'text-green-600' : quote.score < 75 ? 'text-red-500' : 'text-yellow-600'}`}>
                                        {quote.score}%
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-[10px] uppercase font-bold text-slate-400">Cost</div>
                                    <div className="font-bold text-slate-700 dark:text-slate-300">${quote.cost.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Action Right */}
                            <div className="p-4 flex items-center justify-end bg-white dark:bg-slate-800 min-w-[200px]">
                                <button
                                    onClick={() => handleBook(quote)}
                                    className="w-full md:w-auto bg-slate-900 dark:bg-slate-700 hover:bg-blue-600 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95 flex flex-col items-center justify-center leading-none"
                                >
                                    <span className="text-xs opacity-80 font-normal mb-1">Book for</span>
                                    <span className="text-lg">${quote.margin.toLocaleString()} Profit</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex gap-3 text-sm text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                <Info className="shrink-0 text-blue-500" />
                <p>
                    <strong>Tip:</strong> Matching the correct equipment type (e.g. Reefer for Frozen Goods) is critical.
                    Mismatches will result in claims. Higher reliability scores reduce the chance of breakdowns.
                </p>
            </div>
        </div>
    );
};

export default Brokerage;
