import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Package, ArrowRight, Truck, User, DollarSign, MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { CARRIERS } from '../data/gameData';
import { sounds } from '../utils/SoundManager';

const TMS = ({ setActiveTab }) => {
    const { state, dispatch } = useGame();
    const availableLoads = state.loads.filter(l => l.status === 'Available');
    const activeLoads = state.loads.filter(l => ['Dispatched', 'In Transit', 'At Pickup', 'At Delivery'].includes(l.status));
    const [selectedLoadId, setSelectedLoadId] = useState(null);
    const [carrierOptions, setCarrierOptions] = useState([]);

    // Select first load by default if none selected and loads exist
    useEffect(() => {
        if (!selectedLoadId && availableLoads.length > 0) {
            setSelectedLoadId(availableLoads[0].id);
        }
    }, [availableLoads, selectedLoadId]);

    const activeLoad = availableLoads.find(l => l.id === selectedLoadId);

    // Generate carrier options when a load is selected
    useEffect(() => {
        if (activeLoad) {
            // Generate 3 random carrier options tailored to this load
            // Generate 3 carrier options
            const options = Array.from({ length: 3 }).map((_, i) => {
                let baseCarrier = CARRIERS[Math.floor(Math.random() * CARRIERS.length)];

                // GUARANTEE at least one match for the first option
                if (i === 0) {
                    // Filter carriers that match the mode or are 'Any'
                    const matchingCarriers = CARRIERS.filter(c => c.fleet === activeLoad.mode || c.fleet === 'Any');
                    if (matchingCarriers.length > 0) {
                        baseCarrier = matchingCarriers[Math.floor(Math.random() * matchingCarriers.length)];
                    }
                }

                // Adjust cost based on reliability
                let costFactor = 1.0;
                if (baseCarrier.score > 90) costFactor = 1.1; // Expensive
                if (baseCarrier.score < 75) costFactor = 0.8; // Cheap

                // Equipment Mismatch Penalty (but allow quoting)
                let equipmentMatch = true;
                if (baseCarrier.fleet !== 'Any' && baseCarrier.fleet !== activeLoad.mode && activeLoad.mode !== 'Power Only') {
                    equipmentMatch = false;
                    costFactor = 1.5; // Very expensive if wrong equipment (outsourcing)
                }

                // Random variance
                const cost = Math.floor(activeLoad.baseCost * costFactor * (0.9 + Math.random() * 0.2));
                const margin = activeLoad.revenue - cost;

                return {
                    id: `${activeLoad.id}-opt-${i}`,
                    name: baseCarrier.name,
                    score: baseCarrier.score,
                    fleet: baseCarrier.fleet,
                    cost: cost,
                    margin: margin,
                    driver: ['Bob', 'Sarah', 'Mike', 'Big Al', 'Jenny', 'Dav'][Math.floor(Math.random() * 6)],
                    truck: 2018 + Math.floor(Math.random() * 6),
                    equipmentMatch: equipmentMatch
                };
            });
            setCarrierOptions(options);
        }
    }, [selectedLoadId, activeLoad?.id]); // Re-run when load ID changes

    const handleBook = (option) => {
        sounds.playClick();

        // Mismatch Alert Logic
        if (!option.equipmentMatch) {
            sounds.playError();
            if (!window.confirm(`⚠️ EQUIPMENT MISMATCH!\n\nYou are booking a ${option.fleet} for a ${activeLoad.mode} load.\nThis will likely result in a claim or high fees.\n\nAre you sure you want to proceed?`)) {
                return; // Cancel booking
            }
        }

        const success = Math.random() * 100 <= option.score;
        let finalMargin = option.margin;
        let msg = "Load Booked Successfully";

        // Logic checks
        if (activeLoad.mode === 'Reefer' && option.fleet === 'Dry Van') {
            // Major failure
            finalMargin -= 1000;
            msg = "CRITICAL: Dry Van booked for Reefer load! Cargo Spoiled.";
            sounds.playError();
        } else if (!success) {
            finalMargin -= 200;
            msg = "DELAY: Truck breakdown.";
            sounds.playError();
        } else {
            sounds.playSuccess();
            sounds.playTruckStart();
        }

        dispatch({
            type: 'BOOK_LOAD',
            payload: {
                loadId: activeLoad.id,
                quote: { name: option.name, driver: option.driver },
                finalMargin: finalMargin,
                success: success
            }
        });

        // Clear selection or move to next
        setSelectedLoadId(null);
    };

    return (
        <div className="flex h-[calc(100vh-140px)] gap-6">

            {/* LEFT SIDEBAR: LOAD LIST */}
            <div className="w-96 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200">Available Loads</h3>
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">{availableLoads.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {/* ACTIVE SHIPMENTS SECTION */}
                    {activeLoads.length > 0 && (
                        <div className="mb-4">
                            <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">In Transit ({activeLoads.length})</div>
                            {activeLoads.map(load => (
                                <div
                                    key={load.id}
                                    className="p-3 mb-2 rounded border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300">#{load.id.slice(-4)}</span>
                                        <span className="text-[10px] bg-blue-200 text-blue-800 px-1.5 rounded">{load.status}</span>
                                    </div>
                                    <div className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        {load.origin} <ArrowRight size={12} /> {load.dest}
                                    </div>
                                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${load.progress}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* AVAILABLE LOADS SECTION */}
                    <div className="px-2 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Load Board</div>
                    {availableLoads.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            <Package size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No checks available.</p>
                        </div>
                    ) : (
                        availableLoads.map(load => (
                            <div
                                key={load.id}
                                onClick={() => setSelectedLoadId(load.id)}
                                className={`p-4 rounded-lg cursor-pointer border transition-all hover:shadow-md ${selectedLoadId === load.id
                                    ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 dark:bg-blue-900/20 dark:border-blue-400'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                                    }`}
                            >
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                                        ${load.mode === 'Reefer' ? 'bg-blue-100 text-blue-700' :
                                            load.mode === 'Flatbed' ? 'bg-orange-100 text-orange-700' :
                                                'bg-slate-100 text-slate-600'}`}>
                                        {load.mode}
                                    </span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider
                                        ${load.market === 'Headhaul' ? 'bg-emerald-100 text-emerald-700' :
                                            load.market === 'Backhaul' ? 'bg-amber-100 text-amber-700' : 'hidden'}`}>
                                        {load.market}
                                    </span>
                                </div>

                                <div className="font-bold text-slate-800 dark:text-slate-200 text-sm flex items-center gap-1 mb-1">
                                    {load.origin} <ArrowRight size={12} className="text-slate-400" /> {load.dest}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-slate-500">{load.custName} • {load.dist} mi</div>
                                    <div className="font-mono font-bold text-green-600 dark:text-green-400 text-sm">
                                        ${load.revenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN AREA: DETAIL VIEW */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative">
                {!activeLoad ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <ArrowRight size={48} className="mb-4 opacity-20" />
                        <h3 className="text-lg font-bold text-slate-500">Select a Load</h3>
                        <p>Choose a load from the left to view details and options.</p>
                    </div>
                ) : (
                    <div className="flex flex-col h-full animate-in fade-in duration-300">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                        Load #{activeLoad.id.slice(-4)}
                                        <span className={`text-xs px-2 py-1 rounded border ${activeLoad.market === 'Headhaul' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
                                            }`}>{activeLoad.market} MARKET</span>
                                    </h2>
                                    <div className="text-slate-500 mt-1 flex items-center gap-2">
                                        <User size={14} /> {activeLoad.custName}
                                        <span className="text-slate-300">|</span>
                                        <Package size={14} /> {activeLoad.comm}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-slate-500 uppercase font-bold tracking-wider">Revenue</div>
                                    <div className="text-3xl font-mono font-bold text-green-600 dark:text-green-400">
                                        ${activeLoad.revenue.toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            {/* Key Stats Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                <DetailItem label="Origin" value={activeLoad.origin} icon={<MapPin size={14} />} />
                                <DetailItem label="Destination" value={activeLoad.dest} icon={<MapPin size={14} />} />
                                <DetailItem label="Distance" value={`${activeLoad.dist} mi`} icon={<Truck size={14} />} />
                                <DetailItem label="Equipment" value={activeLoad.mode} highlight={true} />
                            </div>

                            <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30 dark:text-amber-400">
                                <AlertCircle size={16} />
                                <strong>Requirements:</strong> {activeLoad.req}
                            </div>
                        </div>

                        {/* CARRIER TABLE */}
                        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/20">
                            <h3 className="font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                                <Truck size={18} /> Available Carriers
                            </h3>

                            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="p-4">Carrier</th>
                                            <th className="p-4">Equipment</th>
                                            <th className="p-4">Reliability</th>
                                            <th className="p-4">Quote</th>
                                            <th className="p-4">Margin ($)</th>
                                            <th className="p-4">Margin (%)</th>
                                            <th className="p-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {carrierOptions.map((opt, idx) => (
                                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <td className="p-4">
                                                    <div className="font-bold text-slate-700 dark:text-slate-200">{opt.name}</div>
                                                    <div className="text-xs text-slate-500">Driver: {opt.driver}</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {opt.fleet}
                                                        {!opt.equipmentMatch && <span className="text-red-500" title="Mismatch!"><AlertCircle size={14} /></span>}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="w-24 bg-slate-200 rounded-full h-1.5 mb-1 overflow-hidden">
                                                        <div className={`h-1.5 rounded-full ${opt.score > 90 ? 'bg-green-500' : opt.score < 75 ? 'bg-red-500' : 'bg-amber-500'}`} style={{ width: `${opt.score}%` }}></div>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-500">{opt.score}% Score</div>
                                                </td>
                                                <td className="p-4 font-mono text-slate-600 dark:text-slate-300">${opt.cost.toLocaleString()}</td>
                                                <td className={`p-4 font-mono font-bold ${opt.margin / activeLoad.revenue > 0.15 ? 'text-green-600' : opt.margin / activeLoad.revenue < 0.05 ? 'text-red-500' : 'text-amber-600'}`}>
                                                    ${opt.margin.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${opt.margin / activeLoad.revenue > 0.15 ? 'bg-green-100 text-green-700' :
                                                            opt.margin / activeLoad.revenue < 0.05 ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {((opt.margin / activeLoad.revenue) * 100).toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <button
                                                        onClick={() => handleBook(opt)}
                                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all active:scale-95"
                                                    >
                                                        Book
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const DetailItem = ({ label, value, icon, highlight }) => (
    <div className="bg-white dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
            {icon} {label}
        </div>
        <div className={`font-bold ${highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {value}
        </div>
    </div>
);

export default TMS;
